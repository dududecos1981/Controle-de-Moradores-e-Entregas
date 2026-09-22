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

  /**
   * Lista ocorrências com filtros e paginação
   */
  async findAll(filters: FilterOcorrenciaDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
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
  async create(dto: CreateOcorrenciaDto, usuarioId: string, context?: LgpdContext): Promise<any> {
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
        dto.unidade_id,
        usuarioId,
        dto.titulo,
        dto.descricao,
        dto.categoria || 'OUTRO',
        dto.foto_url || null,
      ],
      {
        ...context,
        userId: usuarioId,
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
  async responder(id: string, dto: ResponderOcorrenciaDto, sindicoId: string, context?: LgpdContext): Promise<any> {
    const ocorrencia = await this.findOne(id);

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
      [dto.resposta_sindico, dto.status, sindicoId, id],
      {
        ...context,
        userId: sindicoId,
        reason: 'Resposta/parecer do síndico em ocorrência',
      },
    );

    const updated = await this.findOne(id);

    // Emite WebSocket para a unidade do morador
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
