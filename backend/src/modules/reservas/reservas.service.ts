import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateReservaDto, StatusReserva } from './dto/create-reserva.dto';
import { FilterReservaDto } from './dto/filter-reserva.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Lista todas as áreas comuns cadastradas
   */
  async findAllAreas(): Promise<any[]> {
    const query = `
      SELECT 
        id,
        nome,
        descricao,
        capacidade_maxima,
        taxa_reserva,
        foto_url,
        regras,
        status,
        created_at,
        updated_at
      FROM areas_comuns
      ORDER BY nome ASC
    `;
    const res = await this.databaseService.query(query);
    return res.rows;
  }

  /**
   * Lista reservas com filtros avançados
   */
  async findAllReservas(filters: FilterReservaDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.area_id) {
      conditions.push(`r.area_id = $${paramIndex++}`);
      params.push(filters.area_id);
    }
    if (filters.unidade_id) {
      conditions.push(`r.unidade_id = $${paramIndex++}`);
      params.push(filters.unidade_id);
    }
    if (filters.data) {
      conditions.push(`r.data_reserva = $${paramIndex++}`);
      params.push(filters.data);
    }
    if (filters.data_inicio) {
      conditions.push(`r.data_reserva >= $${paramIndex++}`);
      params.push(filters.data_inicio);
    }
    if (filters.data_fim) {
      conditions.push(`r.data_reserva <= $${paramIndex++}`);
      params.push(filters.data_fim);
    }
    if (filters.status) {
      conditions.push(`r.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.periodo) {
      conditions.push(`r.periodo = $${paramIndex++}`);
      params.push(filters.periodo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reservas_areas r
      JOIN areas_comuns a ON a.id = r.area_id
      JOIN unidades un ON un.id = r.unidade_id
      ${whereClause}
    `;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        r.id,
        r.area_id,
        a.nome as area_nome,
        a.foto_url as area_foto,
        a.capacidade_maxima as area_capacidade,
        a.taxa_reserva as area_taxa,
        r.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        r.usuario_id,
        u.nome_completo as solicitante_nome,
        u.telefone as solicitante_telefone,
        r.data_reserva,
        r.periodo,
        r.status,
        r.convidados_estimados,
        r.observacoes,
        r.created_at,
        r.updated_at
      FROM reservas_areas r
      JOIN areas_comuns a ON a.id = r.area_id
      JOIN unidades un ON un.id = r.unidade_id
      JOIN usuarios u ON u.id = r.usuario_id
      ${whereClause}
      ORDER BY r.data_reserva ASC, r.created_at DESC
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
   * Busca detalhes de uma reserva por ID
   */
  async findOneReserva(id: string): Promise<any> {
    const query = `
      SELECT 
        r.id,
        r.area_id,
        a.nome as area_nome,
        a.descricao as area_descricao,
        a.foto_url as area_foto,
        a.regras as area_regras,
        a.capacidade_maxima as area_capacidade,
        a.taxa_reserva as area_taxa,
        r.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        r.usuario_id,
        u.nome_completo as solicitante_nome,
        u.telefone as solicitante_telefone,
        u.email as solicitante_email,
        r.data_reserva,
        r.periodo,
        r.status,
        r.convidados_estimados,
        r.observacoes,
        r.created_at,
        r.updated_at
      FROM reservas_areas r
      JOIN areas_comuns a ON a.id = r.area_id
      JOIN unidades un ON un.id = r.unidade_id
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.id = $1
    `;
    const res = await this.databaseService.query(query, [id]);

    if (res.rowCount === 0) {
      throw new NotFoundException(`Reserva com ID '${id}' não encontrada.`);
    }

    return res.rows[0];
  }

  /**
   * Cria nova reserva com verificação rigorosa de conflitos
   */
  async createReserva(dto: CreateReservaDto, usuarioId: string, context?: LgpdContext): Promise<any> {
    // 1. Verifica existência da área comum
    const areaRes = await this.databaseService.query(
      `SELECT id, nome, status FROM areas_comuns WHERE id = $1`,
      [dto.area_id],
    );
    if (areaRes.rowCount === 0) {
      throw new NotFoundException('Área comum não encontrada.');
    }
    if (areaRes.rows[0].status !== 'DISPONIVEL') {
      throw new BadRequestException('Esta área comum está temporariamente indisponível para reservas.');
    }

    const periodo = dto.periodo || 'NOITE';

    // 2. Verifica se já existe reserva confirmada ou solicitada para a mesma área, data e período
    const conflitoRes = await this.databaseService.query(
      `SELECT id, status FROM reservas_areas 
       WHERE area_id = $1 AND data_reserva = $2 AND periodo = $3 AND status IN ('SOLICITADO', 'CONFIRMADO')`,
      [dto.area_id, dto.data_reserva, periodo],
    );

    if (conflitoRes.rowCount > 0) {
      throw new ConflictException(
        `A área '${areaRes.rows[0].nome}' já possui uma reserva ativa para a data ${dto.data_reserva} no período da ${periodo}.`,
      );
    }

    const insertQuery = `
      INSERT INTO reservas_areas (
        area_id,
        unidade_id,
        usuario_id,
        data_reserva,
        periodo,
        status,
        convidados_estimados,
        observacoes
      ) VALUES ($1, $2, $3, $4, $5, 'CONFIRMADO', $6, $7)
      RETURNING id
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.area_id,
        dto.unidade_id,
        usuarioId,
        dto.data_reserva,
        periodo,
        dto.convidados_estimados || null,
        dto.observacoes || null,
      ],
      {
        ...context,
        userId: usuarioId,
        reason: 'Reserva de área comum pelo morador',
      },
    );

    const novaReserva = await this.findOneReserva(res.rows[0].id);

    try {
      this.eventsGateway.server?.to('portaria_geral').emit('reserva_criada', {
        tipo: 'NOVA_RESERVA',
        reserva: novaReserva,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      this.logger.warn(`Erro emitindo WebSocket: ${e.message}`);
    }

    return novaReserva;
  }

  /**
   * Atualiza status da reserva (ex: CONFIRMADO, CANCELADO)
   */
  async updateStatusReserva(id: string, status: StatusReserva, responsavelId: string, context?: LgpdContext): Promise<any> {
    await this.findOneReserva(id);

    const query = `
      UPDATE reservas_areas
      SET status = $1, updated_at = clock_timestamp()
      WHERE id = $2
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(query, [status, id], {
      ...context,
      userId: responsavelId,
      reason: `Alteração de status da reserva para ${status}`,
    });

    return this.findOneReserva(id);
  }
}
