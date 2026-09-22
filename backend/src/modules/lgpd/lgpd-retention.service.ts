import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { LocalStorageService } from '../upload/services/local-storage.service';
import { S3StorageService } from '../upload/services/s3-storage.service';

export interface ExpurgoResult {
  executadoEm: string;
  diasRetencao: number;
  totalVisitantesAnonimizados: number;
  fotosRemovidas: number;
  detalhes: Array<{
    id: string;
    nomeAnteriorMascarado: string;
    diasInativo: number;
  }>;
}

@Injectable()
export class LgpdRetentionService {
  private readonly logger = new Logger(LgpdRetentionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly localStorage: LocalStorageService,
    private readonly s3Storage: S3StorageService,
  ) {}

  /**
   * Cron Job diário executado às 03:00 da manhã
   * Realiza a anonimização e expurgo de dados de visitantes temporários (LGPD Art. 15 e 16)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyLgpdPurge() {
    this.logger.log('⏰ [LGPD CRON] Iniciando rotina automática diária de expurgo e anonimização...');
    try {
      const result = await this.executarExpurgoVisitantes();
      this.logger.log(
        `✅ [LGPD CRON] Concluído: ${result.totalVisitantesAnonimizados} visitantes temporários anonimizados, ${result.fotosRemovidas} fotos expurgadas.`,
      );
    } catch (error) {
      this.logger.error(`❌ [LGPD CRON] Erro ao executar rotina de expurgo: ${error.message}`, error.stack);
    }
  }

  /**
   * Executa o expurgo de visitantes com mais de X dias sem acessos
   */
  async executarExpurgoVisitantes(diasCustomizados?: number): Promise<ExpurgoResult> {
    const diasRetencao = diasCustomizados || this.configService.get<number>('LGPD_RETENTION_DAYS', 90);
    const executadoEm = new Date().toISOString();

    this.logger.log(`🔍 Buscando visitantes temporários inativos há mais de ${diasRetencao} dias...`);

    // Busca visitantes inativos ou cuja última visita excedeu o prazo de retenção
    const queryBusca = `
      SELECT 
        v.id,
        v.nome_completo,
        v.foto_url,
        v.created_at,
        EXTRACT(DAY FROM (NOW() - COALESCE(MAX(ag.created_at), v.created_at)))::INTEGER as dias_inativo
      FROM visitantes v
      LEFT JOIN agendamentos_visita ag ON ag.visitante_id = v.id
      WHERE v.lgpd_anonimizado = FALSE
      GROUP BY v.id
      HAVING (NOW() - COALESCE(MAX(ag.created_at), v.created_at)) > ($1 || ' days')::INTERVAL
    `;

    const visitantesExpirados = await this.databaseService.query(queryBusca, [diasRetencao]);
    const total = visitantesExpirados.rowCount || 0;

    let fotosRemovidas = 0;
    const detalhes = [];

    for (const row of visitantesExpirados.rows) {
      const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
      const nomeMascarado = row.nome_completo.substring(0, 3) + '***';

      // 1. Expurgo físico da foto biométrica no storage (se houver)
      if (row.foto_url) {
        try {
          const filename = row.foto_url.split('/').pop();
          if (filename) {
            await this.localStorage.deleteFile(filename, 'visitantes');
            fotosRemovidas++;
          }
        } catch (e) {
          this.logger.warn(`Não foi possível remover arquivo de foto: ${row.foto_url}`);
        }
      }

      // 2. Anonimização do registro no Neon PostgreSQL
      const queryAnonimizar = `
        UPDATE visitantes
        SET 
          nome_completo = $1,
          cpf = $2,
          rg = NULL,
          telefone = NULL,
          empresa = NULL,
          placa_veiculo = NULL,
          foto_url = NULL,
          observacoes = '[DADOS_EXPURGADOS_LGPD]',
          ativo = FALSE,
          lgpd_anonimizado = TRUE,
          updated_at = clock_timestamp()
        WHERE id = $3
      `;

      await this.databaseService.query(queryAnonimizar, [
        `VISITANTE_EXPURGADO_${randomHash}`,
        `EXPURGADO_${randomHash}`,
        row.id,
      ]);

      // 3. Trilha de Auditoria LGPD
      const queryAuditoria = `
        INSERT INTO logs_auditoria_lgpd (
          tabela,
          operacao,
          registro_id,
          motivo_operacao,
          usuario_contexto,
          campos_alterados,
          dados_novos,
          created_at
        ) VALUES (
          'visitantes',
          'ANONIMIZACAO_LGPD',
          $1,
          'Expurgo automático por término do período de retenção legal (Art. 15 e 16 da LGPD)',
          'SISTEMA_CRON_RETENCAO',
          ARRAY['nome_completo', 'cpf', 'rg', 'telefone', 'foto_url', 'observacoes', 'lgpd_anonimizado'],
          $2,
          clock_timestamp()
        )
      `;

      await this.databaseService.query(queryAuditoria, [
        row.id,
        JSON.stringify({
          nome_anterior_mascarado: nomeMascarado,
          prazo_retencao_dias: diasRetencao,
          dias_inativo: row.dias_inativo,
          fundamento_legal: 'Lei nº 13.709/2018 (LGPD), Artigo 16 - Eliminação de Dados Pessoais',
        }),
      ]);

      detalhes.push({
        id: row.id,
        nomeAnteriorMascarado: nomeMascarado,
        diasInativo: row.dias_inativo,
      });
    }

    return {
      executadoEm,
      diasRetencao,
      totalVisitantesAnonimizados: total,
      fotosRemovidas,
      detalhes,
    };
  }

  /**
   * Consulta a trilha de auditoria LGPD com filtros e paginação
   */
  async getLogsAuditoria(filters: {
    tabela?: string;
    operacao?: string;
    data_inicio?: string;
    data_fim?: string;
    busca?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 25));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.tabela) {
      conditions.push(`l.tabela = $${paramIndex++}`);
      params.push(filters.tabela);
    }
    if (filters.operacao) {
      conditions.push(`l.operacao = $${paramIndex++}`);
      params.push(filters.operacao);
    }
    if (filters.data_inicio) {
      conditions.push(`l.created_at >= $${paramIndex++}`);
      params.push(filters.data_inicio);
    }
    if (filters.data_fim) {
      conditions.push(`l.created_at <= $${paramIndex++}`);
      params.push(filters.data_fim);
    }
    if (filters.busca) {
      conditions.push(
        `(l.tabela ILIKE $${paramIndex} OR l.motivo_operacao ILIKE $${paramIndex} OR l.usuario_contexto ILIKE $${paramIndex} OR u.nome_completo ILIKE $${paramIndex})`,
      );
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM logs_auditoria_lgpd l
      LEFT JOIN usuarios u ON u.id = l.usuario_responsavel_id
      ${whereClause}
    `;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        l.id,
        l.tabela,
        l.operacao,
        l.registro_id,
        l.usuario_responsavel_id,
        u.nome_completo as usuario_responsavel_nome,
        u.email as usuario_responsavel_email,
        l.usuario_contexto,
        l.ip_origem,
        l.dados_anteriores,
        l.dados_novos,
        l.campos_alterados,
        l.motivo_operacao,
        l.created_at
      FROM logs_auditoria_lgpd l
      LEFT JOIN usuarios u ON u.id = l.usuario_responsavel_id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);
    const result = await this.databaseService.query(query, params);

    return {
      data: result.rows,
      total,
      page,
      limit,
    };
  }

  /**
   * Executa anonimização de usuário morador (Direito ao Esquecimento - Art 18 LGPD)
   */
  async anonimizarUsuario(usuarioId: string, motivo?: string): Promise<{ success: boolean; message: string }> {
    const motivoFinal = motivo || 'Solicitação expressa do titular conforme Art. 18 da LGPD';
    await this.databaseService.query(
      `SELECT fn_anonimizar_usuario_lgpd($1, $2)`,
      [usuarioId, motivoFinal],
    );

    return {
      success: true,
      message: `Dados do titular anonimizados com sucesso em conformidade com o Artigo 18 da LGPD.`,
    };
  }
}
