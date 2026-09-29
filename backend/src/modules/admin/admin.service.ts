import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Coleta métricas gerais consolidadas de todo o condomínio
   */
  async getMetricasGerais() {
    const [
      usuariosRes,
      unidadesRes,
      entregasRes,
      visitantesRes,
      veiculosRes,
      ocorrenciasRes,
      reservasRes,
      auditoriaRes,
    ] = await Promise.all([
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN perfil = 'MORADOR' THEN 1 END)::int AS moradores,
          COUNT(CASE WHEN perfil = 'PORTEIRO' THEN 1 END)::int AS porteiros,
          COUNT(CASE WHEN perfil = 'SINDICO' THEN 1 END)::int AS sindicos,
          COUNT(CASE WHEN perfil = 'ADMINISTRADOR' THEN 1 END)::int AS administradores,
          COUNT(CASE WHEN status = 'ATIVO' THEN 1 END)::int AS ativos
        FROM usuarios
      `),
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN status = 'ATIVO' THEN 1 END)::int AS ativas
        FROM unidades
      `),
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN status = 'AGUARDANDO_RETIRADA' THEN 1 END)::int AS pendentes,
          COUNT(CASE WHEN status = 'RETIRADO' THEN 1 END)::int AS retiradas,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END)::int AS recebidas_hoje
        FROM entregas
      `),
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN tipo = 'VISITANTE' THEN 1 END)::int AS visitantes_comuns,
          COUNT(CASE WHEN tipo = 'PRESTADOR_SERVICO' OR tipo = 'PRESTADOR' THEN 1 END)::int AS prestadores,
          COUNT(CASE WHEN ativo = true THEN 1 END)::int AS ativos
        FROM visitantes
      `),
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN UPPER(tipo::text) = 'CARRO' THEN 1 END)::int AS carros,
          COUNT(CASE WHEN UPPER(tipo::text) = 'MOTO' THEN 1 END)::int AS motos
        FROM veiculos
      `),
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN status = 'ABERTO' THEN 1 END)::int AS abertas,
          COUNT(CASE WHEN status = 'EM_ANDAMENTO' THEN 1 END)::int AS em_andamento,
          COUNT(CASE WHEN status = 'RESOLVIDO' THEN 1 END)::int AS resolvidas
        FROM ocorrencias
      `),
      this.databaseService.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(CASE WHEN status = 'CONFIRMADO' OR status = 'APROVADO' OR status = 'SOLICITADO' THEN 1 END)::int AS confirmadas,
          COUNT(CASE WHEN data_reserva >= CURRENT_DATE THEN 1 END)::int AS futuras
        FROM reservas_areas
      `),
      this.databaseService.query(`
        SELECT COUNT(*)::int AS total FROM logs_auditoria_lgpd
      `),
    ]);

    return {
      usuarios: usuariosRes.rows[0] || {},
      unidades: unidadesRes.rows[0] || {},
      entregas: entregasRes.rows[0] || {},
      visitantes: visitantesRes.rows[0] || {},
      veiculos: veiculosRes.rows[0] || {},
      ocorrencias: ocorrenciasRes.rows[0] || {},
      reservas: reservasRes.rows[0] || {},
      auditoria: auditoriaRes.rows[0] || {},
      geradoEm: new Date().toISOString(),
    };
  }

  /**
   * Gera relatório detalhado por categoria com filtros de período
   */
  async getRelatorioDetalhado(tipo: string, dataInicio?: string, dataFim?: string, status?: string) {
    const cleanTipo = tipo.toUpperCase().trim();

    let query = '';
    const params: any[] = [];
    let paramIndex = 1;

    switch (cleanTipo) {
      case 'ENCOMENDAS':
        query = `
          SELECT 
            e.id,
            e.codigo_rastreio,
            e.codigo_barras_qrcode,
            e.transportadora,
            e.descricao_pacote,
            e.status,
            e.data_recebimento,
            e.data_retirada,
            e.retirado_por_nome,
            u.bloco AS unidade_bloco,
            u.numero AS unidade_numero,
            usr.nome_completo AS morador_nome,
            e.created_at
          FROM entregas e
          LEFT JOIN unidades u ON e.unidade_id = u.id
          LEFT JOIN usuarios usr ON e.usuario_destinatario_id = usr.id
          WHERE 1=1
        `;
        if (dataInicio) {
          query += ` AND e.created_at >= $${paramIndex++}`;
          params.push(dataInicio);
        }
        if (dataFim) {
          query += ` AND e.created_at <= $${paramIndex++}`;
          params.push(dataFim + ' 23:59:59');
        }
        if (status && status !== 'TODOS') {
          query += ` AND e.status = $${paramIndex++}`;
          params.push(status);
        }
        query += ` ORDER BY e.created_at DESC`;
        break;

      case 'VISITANTES':
      case 'PRESTADORES':
        query = `
          SELECT 
            v.id,
            v.nome_completo,
            v.cpf,
            v.telefone,
            v.tipo,
            v.empresa,
            v.placa_veiculo,
            v.codigo_acesso,
            v.ativo,
            v.observacoes,
            u.bloco AS unidade_bloco,
            u.numero AS unidade_numero,
            v.created_at
          FROM visitantes v
          LEFT JOIN unidades u ON v.unidade_destino_id = u.id
          WHERE 1=1
        `;
        if (cleanTipo === 'PRESTADORES') {
          query += ` AND (v.tipo = 'PRESTADOR_SERVICO' OR v.tipo = 'PRESTADOR')`;
        }
        if (dataInicio) {
          query += ` AND v.created_at >= $${paramIndex++}`;
          params.push(dataInicio);
        }
        if (dataFim) {
          query += ` AND v.created_at <= $${paramIndex++}`;
          params.push(dataFim + ' 23:59:59');
        }
        query += ` ORDER BY v.created_at DESC`;
        break;

      case 'MORADORES':
      case 'USUARIOS':
        query = `
          SELECT 
            usr.id,
            usr.nome_completo,
            usr.cpf,
            usr.email,
            usr.telefone,
            usr.perfil,
            usr.status,
            usr.is_responsavel_unidade,
            usr.lgpd_termo_aceito,
            usr.lgpd_data_aceite,
            u.bloco AS unidade_bloco,
            u.numero AS unidade_numero,
            usr.created_at
          FROM usuarios usr
          LEFT JOIN unidades u ON usr.unidade_id = u.id
          WHERE 1=1
        `;
        if (status && status !== 'TODOS') {
          query += ` AND usr.status = $${paramIndex++}`;
          params.push(status);
        }
        query += ` ORDER BY usr.created_at DESC`;
        break;

      case 'VEICULOS':
        query = `
          SELECT 
            v.id,
            v.placa,
            v.marca,
            v.modelo,
            v.cor,
            v.tipo,
            v.vaga_garagem,
            v.observacoes,
            u.bloco AS unidade_bloco,
            u.numero AS unidade_numero,
            usr.nome_completo AS proprietario_nome,
            v.created_at
          FROM veiculos v
          LEFT JOIN unidades u ON v.unidade_id = u.id
          LEFT JOIN usuarios usr ON v.usuario_id = usr.id
          ORDER BY v.created_at DESC
        `;
        break;

      case 'OCORRENCIAS':
        query = `
          SELECT 
            o.id,
            o.titulo,
            o.descricao,
            o.categoria,
            o.status,
            o.resposta_sindico,
            o.data_resposta,
            u.bloco AS unidade_bloco,
            u.numero AS unidade_numero,
            usr.nome_completo AS solicitante_nome,
            o.created_at
          FROM ocorrencias o
          LEFT JOIN unidades u ON o.unidade_id = u.id
          LEFT JOIN usuarios usr ON o.usuario_id = usr.id
          WHERE 1=1
        `;
        if (status && status !== 'TODOS') {
          query += ` AND o.status = $${paramIndex++}`;
          params.push(status);
        }
        query += ` ORDER BY o.created_at DESC`;
        break;

      case 'RESERVAS':
        query = `
          SELECT 
            r.id,
            r.data_reserva,
            r.periodo,
            r.status,
            r.convidados_estimados,
            r.observacoes,
            a.nome AS area_nome,
            a.taxa_reserva,
            u.bloco AS unidade_bloco,
            u.numero AS unidade_numero,
            usr.nome_completo AS responsavel_nome,
            r.created_at
          FROM reservas_areas r
          LEFT JOIN areas_comuns a ON r.area_id = a.id
          LEFT JOIN unidades u ON r.unidade_id = u.id
          LEFT JOIN usuarios usr ON r.usuario_id = usr.id
          WHERE 1=1
        `;
        if (dataInicio) {
          query += ` AND r.data_reserva >= $${paramIndex++}`;
          params.push(dataInicio);
        }
        if (dataFim) {
          query += ` AND r.data_reserva <= $${paramIndex++}`;
          params.push(dataFim);
        }
        if (status && status !== 'TODOS') {
          query += ` AND r.status = $${paramIndex++}`;
          params.push(status);
        }
        query += ` ORDER BY r.data_reserva DESC`;
        break;

      case 'LGPD_AUDITORIA':
        query = `
          SELECT 
            a.id,
            a.tabela,
            a.operacao,
            a.registro_id,
            a.usuario_responsavel_id,
            a.usuario_contexto,
            a.ip_origem,
            a.motivo_operacao,
            a.created_at
          FROM logs_auditoria_lgpd a
          ORDER BY a.created_at DESC
          LIMIT 200
        `;
        break;

      default:
        throw new BadRequestException(`Tipo de relatório inválido: ${tipo}`);
    }

    const result = await this.databaseService.query(query, params);

    return {
      tipo: cleanTipo,
      totalRegistros: result.rowCount,
      filtros: { dataInicio, dataFim, status },
      dados: result.rows,
      geradoEm: new Date().toISOString(),
    };
  }

  /**
   * Exporta backup completo do banco de dados Neon em formato JSON estruturado
   */
  async exportBackupJson() {
    this.logger.log('📦 Iniciando processo de extração de Backup Geral (JSON)...');

    const tables = [
      'unidades',
      'usuarios',
      'areas_comuns',
      'entregas',
      'visitantes',
      'agendamentos_visita',
      'veiculos',
      'ocorrencias',
      'reservas_areas',
      'logs_auditoria_lgpd',
    ];

    const backupData: Record<string, any[]> = {};
    let totalRecordsCount = 0;

    for (const table of tables) {
      try {
        const res = await this.databaseService.query(`SELECT * FROM "${table}" ORDER BY created_at ASC`);
        backupData[table] = res.rows;
        totalRecordsCount += res.rowCount || 0;
      } catch (err: any) {
        this.logger.warn(`Tabela ${table} não extraída: ${err.message}`);
        backupData[table] = [];
      }
    }

    const rawPayload = JSON.stringify(backupData);
    const checksum = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const fullBackupPackage = {
      versao_schema: '1.0.0',
      tipo_backup: 'COMPLETO_SISTEMA',
      banco_dados: 'PostgreSQL Neon Serverless',
      gerado_em: new Date().toISOString(),
      checksum_sha256: checksum,
      estatisticas: {
        tabelas_incluidas: tables.length,
        total_registros: totalRecordsCount,
        detalhe_tabelas: Object.fromEntries(
          Object.entries(backupData).map(([tbl, rows]) => [tbl, rows.length]),
        ),
      },
      dados: backupData,
    };

    try {
      await this.databaseService.query(
        `INSERT INTO logs_auditoria_lgpd (tabela, operacao, registro_id, usuario_contexto, motivo_operacao, dados_novos) 
         VALUES ($1, $2, gen_random_uuid(), $3, $4, $5)`,
        [
          'SISTEMA_GERAL',
          'INSERT',
          'ADMINISTRADOR',
          'Exportação de backup JSON do sistema',
          JSON.stringify({ checksum, totalRegistros: totalRecordsCount }),
        ],
      );
    } catch (e: any) {
      this.logger.warn(`Auditoria de exportação: ${e.message}`);
    }

    return fullBackupPackage;
  }

  /**
   * Exporta backup em formato script SQL compatível com PostgreSQL
   */
  async exportBackupSql() {
    this.logger.log('📜 Gerando script SQL Dump do banco de dados...');
    const tables = [
      'unidades',
      'usuarios',
      'areas_comuns',
      'entregas',
      'visitantes',
      'agendamentos_visita',
      'veiculos',
      'ocorrencias',
      'reservas_areas',
      'logs_auditoria_lgpd',
    ];

    let sqlDump = `-- =============================================================================\n`;
    sqlDump += `-- BACKUP DO SISTEMA DE PORTARIA & ENTREGAS (NEON POSTGRESQL)\n`;
    sqlDump += `-- GERADO EM: ${new Date().toISOString()}\n`;
    sqlDump += `-- =============================================================================\n\n`;

    for (const table of tables) {
      try {
        const res = await this.databaseService.query(`SELECT * FROM "${table}"`);
        if (res.rows.length === 0) continue;

        sqlDump += `-- -----------------------------------------------------------------------------\n`;
        sqlDump += `-- TABELA: ${table} (${res.rows.length} registros)\n`;
        sqlDump += `-- -----------------------------------------------------------------------------\n`;

        for (const row of res.rows) {
          const columns = Object.keys(row).map((k) => `"${k}"`).join(', ');
          const values = Object.values(row)
            .map((v) => {
              if (v === null || v === undefined) return 'NULL';
              if (typeof v === 'boolean' || typeof v === 'number') return v;
              if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
              return `'${String(v).replace(/'/g, "''")}'`;
            })
            .join(', ');

          sqlDump += `INSERT INTO "${table}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
        }
        sqlDump += `\n`;
      } catch (err: any) {
        this.logger.warn(`Erro ao gerar SQL para ${table}: ${err.message}`);
      }
    }

    return sqlDump;
  }

  /**
   * Restaura dados a partir de um backup JSON validado
   */
  async restoreBackupJson(backupPayload: any) {
    if (!backupPayload || !backupPayload.dados) {
      throw new BadRequestException('Estrutura de arquivo de backup inválida ou corrompida.');
    }

    const { dados } = backupPayload;
    this.logger.log('🔄 Iniciando processo de restauração segura de dados...');

    let restoredCount = 0;
    const client = await this.databaseService.getPool().connect();

    try {
      await client.query('BEGIN');

      const tablesOrder = [
        'unidades',
        'usuarios',
        'areas_comuns',
        'entregas',
        'visitantes',
        'agendamentos_visita',
        'veiculos',
        'ocorrencias',
        'reservas_areas',
        'logs_auditoria_lgpd',
      ];

      for (const table of tablesOrder) {
        const rows = dados[table];
        if (Array.isArray(rows) && rows.length > 0) {
          for (const row of rows) {
            const columns = Object.keys(row).map((c) => `"${c}"`).join(', ');
            const valuePlaceholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(', ');
            const values = Object.values(row);

            const insertQuery = `
              INSERT INTO "${table}" (${columns}) 
              VALUES (${valuePlaceholders}) 
              ON CONFLICT DO NOTHING
            `;
            await client.query(insertQuery, values);
            restoredCount++;
          }
        }
      }

      await client.query('COMMIT');

      try {
        await this.databaseService.query(
          `INSERT INTO logs_auditoria_lgpd (tabela, operacao, registro_id, usuario_contexto, motivo_operacao, dados_novos) 
           VALUES ($1, $2, gen_random_uuid(), $3, $4, $5)`,
          [
            'SISTEMA_GERAL',
            'INSERT',
            'ADMINISTRADOR',
            'Restauração de backup JSON pelo Administrador',
            JSON.stringify({ restoredCount, timestamp: new Date().toISOString() }),
          ],
        );
      } catch (e: any) {
        this.logger.warn(`Auditoria de restauração: ${e.message}`);
      }

      return {
        sucesso: true,
        mensagem: `Restauração concluída com sucesso! ${restoredCount} registro(s) processados.`,
        restoredCount,
        restauradoEm: new Date().toISOString(),
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      this.logger.error('Erro ao restaurar backup:', error);
      throw new BadRequestException(`Falha na restauração: ${error.message}`);
    } finally {
      client.release();
    }
  }
}
