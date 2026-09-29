import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { ResponderOcorrenciaDto } from './dto/responder-ocorrencia.dto';
import { FilterOcorrenciaDto } from './dto/filter-ocorrencia.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OcorrenciasService {
  private readonly logger = new Logger(OcorrenciasService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async resolveUnidadeId(unidadeId?: string, bloco?: string, numero?: string): Promise<string> {
    if (unidadeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unidadeId)) {
      const check = await this.databaseService.query('SELECT id FROM unidades WHERE id = $1', [unidadeId]);
      if (check.rowCount > 0) return check.rows[0].id;
    }

    let searchBloco = bloco;
    let searchNumero = numero;

    if (!searchBloco && !searchNumero && unidadeId && unidadeId.includes('-')) {
      const parts = unidadeId.replace(/^u-/, '').split('-');
      if (parts.length >= 2) {
        searchBloco = parts[0];
        searchNumero = parts[1];
      }
    }

    if (searchBloco && searchNumero) {
      const cleanB = searchBloco.trim().toUpperCase();
      const cleanN = searchNumero.trim().toUpperCase();
      const check = await this.databaseService.query(
        'SELECT id FROM unidades WHERE UPPER(bloco) = $1 AND UPPER(numero) = $2 LIMIT 1',
        [cleanB, cleanN],
      );
      if (check.rowCount > 0) return check.rows[0].id;

      const created = await this.databaseService.query(
        `INSERT INTO unidades (bloco, numero, tipo, status) VALUES ($1, $2, 'APARTAMENTO', 'ATIVO') RETURNING id`,
        [cleanB, cleanN],
      );
      return created.rows[0].id;
    }

    const fallback = await this.databaseService.query('SELECT id FROM unidades WHERE status = \'ATIVO\' LIMIT 1');
    if (fallback.rowCount > 0) return fallback.rows[0].id;

    const createdDefault = await this.databaseService.query(
      `INSERT INTO unidades (bloco, numero, tipo, status) VALUES ('A', '101', 'APARTAMENTO', 'ATIVO') RETURNING id`,
    );
    return createdDefault.rows[0].id;
  }

  private async resolveUsuarioId(usuarioId?: string, unidadeId?: string): Promise<string> {
    if (usuarioId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usuarioId)) {
      const check = await this.databaseService.query('SELECT id FROM usuarios WHERE id = $1', [usuarioId]);
      if (check.rowCount > 0) return check.rows[0].id;
    }

    if (unidadeId) {
      const checkMorador = await this.databaseService.query(
        'SELECT id FROM usuarios WHERE unidade_id = $1 AND status = \'ATIVO\' ORDER BY is_responsavel_unidade DESC LIMIT 1',
        [unidadeId],
      );
      if (checkMorador.rowCount > 0) return checkMorador.rows[0].id;
    }

    const anyUser = await this.databaseService.query('SELECT id FROM usuarios WHERE status = \'ATIVO\' LIMIT 1');
    if (anyUser.rowCount > 0) return anyUser.rows[0].id;

    throw new BadRequestException('Nenhum usuário cadastrado para associar ao chamado.');
  }

  /**
   * Lista ocorrências com filtros e paginação
   */
  async findAll(filters: FilterOcorrenciaDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(
        `(o.titulo ILIKE $${paramIndex} OR o.descricao ILIKE $${paramIndex} OR u.nome_completo ILIKE $${paramIndex} OR un.bloco ILIKE $${paramIndex} OR un.numero ILIKE $${paramIndex})`,
      );
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.categoria) {
      conditions.push(`o.categoria = $${paramIndex++}`);
      params.push(filters.categoria);
    }
    if (filters.unidade_id) {
      conditions.push(`o.unidade_id = $${paramIndex++}`);
      params.push(filters.unidade_id);
    }
    if (filters.usuario_id) {
      conditions.push(`o.usuario_id = $${paramIndex++}`);
      params.push(filters.usuario_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM ocorrencias o
      JOIN unidades un ON un.id = o.unidade_id
      JOIN usuarios u ON u.id = o.usuario_id
      ${whereClause}
    `;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        o.id,
        o.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        o.usuario_id,
        u.nome_completo as solicitante_nome,
        u.telefone as solicitante_telefone,
        o.titulo,
        o.descricao,
        o.categoria,
        o.foto_url,
        o.status,
        o.resposta_sindico,
        o.respondido_por_id,
        resp.nome_completo as respondido_por_nome,
        o.respondido_em,
        o.created_at,
        o.updated_at
      FROM ocorrencias o
      JOIN unidades un ON un.id = o.unidade_id
      JOIN usuarios u ON u.id = o.usuario_id
      LEFT JOIN usuarios resp ON resp.id = o.respondido_por_id
      ${whereClause}
      ORDER BY 
        CASE WHEN o.status IN ('ABERTO', 'EM_ANALISE', 'EM_ANDAMENTO') THEN 0 ELSE 1 END,
        o.created_at DESC
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
   * Busca ocorrência por ID
   */
  async findOne(id: string): Promise<any> {
    const query = `
      SELECT 
        o.id,
        o.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        o.usuario_id,
        u.nome_completo as solicitante_nome,
        u.telefone as solicitante_telefone,
        u.email as solicitante_email,
        o.titulo,
        o.descricao,
        o.categoria,
        o.foto_url,
        o.status,
        o.resposta_sindico,
        o.respondido_por_id,
        resp.nome_completo as respondido_por_nome,
        o.respondido_em,
        o.created_at,
        o.updated_at
      FROM ocorrencias o
      JOIN unidades un ON un.id = o.unidade_id
      JOIN usuarios u ON u.id = o.usuario_id
      LEFT JOIN usuarios resp ON resp.id = o.respondido_por_id
      WHERE o.id = $1
    `;
    const res = await this.databaseService.query(query, [id]);

    if (res.rowCount === 0) {
      throw new NotFoundException(`Ocorrência com ID '${id}' não encontrada.`);
    }

    return res.rows[0];
  }

  /**
   * Cria nova ocorrência/chamado pelo morador
   */
  async create(dto: CreateOcorrenciaDto, usuarioId?: string, context?: LgpdContext): Promise<any> {
    const finalUnidadeId = await this.resolveUnidadeId(dto.unidade_id, dto.unidade_bloco, dto.unidade_numero);
    const finalUsuarioId = await this.resolveUsuarioId(usuarioId, finalUnidadeId);

    const insertQuery = `
      INSERT INTO ocorrencias (
        unidade_id,
        usuario_id,
        titulo,
        descricao,
        categoria,
        foto_url,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'ABERTO')
      RETURNING id
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        finalUnidadeId,
        finalUsuarioId,
        dto.titulo,
        dto.descricao,
        dto.categoria || 'OUTRO',
        dto.foto_url || null,
      ],
      {
        ...context,
        userId: finalUsuarioId,
        reason: 'Abertura de ocorrência/chamado de manutenção',
      },
    );

    const novaOcorrencia = await this.findOne(res.rows[0].id);

    try {
      this.eventsGateway.server?.to('portaria_geral').emit('ocorrencia_criada', {
        tipo: 'NOVA_OCORRENCIA',
        ocorrencia: novaOcorrencia,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      this.logger.warn(`Não foi possível emitir WebSocket para nova ocorrência: ${e.message}`);
    }

    return novaOcorrencia;
  }

  /**
   * Síndico ou porteiro responde e atualiza status da ocorrência
   */
  async responder(id: string, dto: ResponderOcorrenciaDto, sindicoId?: string, context?: LgpdContext): Promise<any> {
    const ocorrencia = await this.findOne(id);
    const finalSindicoId = await this.resolveUsuarioId(sindicoId);

    const query = `
      UPDATE ocorrencias
      SET 
        resposta_sindico = $1,
        status = $2,
        respondido_por_id = $3,
        respondido_em = clock_timestamp(),
        updated_at = clock_timestamp()
      WHERE id = $4
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(
      query,
      [dto.resposta_sindico, dto.status, finalSindicoId, id],
      {
        ...context,
        userId: finalSindicoId,
        reason: 'Resposta/parecer do síndico em ocorrência',
      },
    );

    const updated = await this.findOne(id);

    try {
      const room = `unidade_${ocorrencia.unidade_bloco}_${ocorrencia.unidade_numero}`;
      this.eventsGateway.server?.to(room).emit('ocorrencia_respondida', {
        tipo: 'OCORRENCIA_ATUALIZADA',
        titulo: 'Sua ocorrência foi respondida pela administração',
        ocorrencia: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      this.logger.warn(`Erro emitindo WebSocket: ${e.message}`);
    }

    return updated;
  }
}
