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

  private async resolveAreaId(areaId: string): Promise<string> {
    if (areaId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(areaId)) {
      const check = await this.databaseService.query('SELECT id FROM areas_comuns WHERE id = $1', [areaId]);
      if (check.rowCount > 0) return check.rows[0].id;
    }

    const byName = await this.databaseService.query(
      'SELECT id FROM areas_comuns WHERE nome ILIKE $1 LIMIT 1',
      [`%${areaId}%`],
    );
    if (byName.rowCount > 0) return byName.rows[0].id;

    const firstArea = await this.databaseService.query('SELECT id FROM areas_comuns LIMIT 1');
    if (firstArea.rowCount > 0) return firstArea.rows[0].id;

    throw new NotFoundException('Área comum não encontrada.');
  }

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

    throw new BadRequestException('Nenhum usuário cadastrado para associar à reserva.');
  }

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
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
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
      ORDER BY r.data_reserva DESC, r.created_at DESC
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
  async createReserva(dto: CreateReservaDto, usuarioId?: string, context?: LgpdContext): Promise<any> {
    const finalAreaId = await this.resolveAreaId(dto.area_id);
    const finalUnidadeId = await this.resolveUnidadeId(dto.unidade_id, dto.unidade_bloco, dto.unidade_numero);
    const finalUsuarioId = await this.resolveUsuarioId(usuarioId, finalUnidadeId);

    const periodo = dto.periodo || 'NOITE';

    // Verifica se já existe reserva confirmada ou solicitada para a mesma área, data e período
    const conflitoRes = await this.databaseService.query(
      `SELECT id, status FROM reservas_areas 
       WHERE area_id = $1 AND data_reserva = $2 AND periodo = $3 AND status IN ('SOLICITADO', 'CONFIRMADO')`,
      [finalAreaId, dto.data_reserva, periodo],
    );

    if (conflitoRes.rowCount > 0) {
      throw new ConflictException(
        `Esta área comum já possui uma reserva ativa para a data ${dto.data_reserva} no período da ${periodo}.`,
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
        finalAreaId,
        finalUnidadeId,
        finalUsuarioId,
        dto.data_reserva,
        periodo,
        dto.convidados_estimados || null,
        dto.observacoes || null,
      ],
      {
        ...context,
        userId: finalUsuarioId,
        reason: 'Reserva de área comum',
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
      this.logger.warn(`Não foi possível emitir WebSocket de reserva: ${e.message}`);
    }

    return novaReserva;
  }

  /**
   * Atualiza o status da reserva
   */
  async updateStatusReserva(id: string, status: StatusReserva, sindicoId?: string, context?: LgpdContext): Promise<any> {
    await this.findOneReserva(id);
    const finalSindicoId = await this.resolveUsuarioId(sindicoId);

    const query = `
      UPDATE reservas_areas
      SET status = $1, updated_at = clock_timestamp()
      WHERE id = $2
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(
      query,
      [status, id],
      {
        ...context,
        userId: finalSindicoId,
        reason: `Alteração de status de reserva para ${status}`,
      },
    );

    return this.findOneReserva(id);
  }

  async updateStatus(id: string, status: StatusReserva, sindicoId?: string, context?: LgpdContext): Promise<any> {
    return this.updateStatusReserva(id, status, sindicoId, context);
  }
}
