import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { FilterAgendamentoDto } from './dto/filter-agendamento.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AgendamentosService {
  private readonly logger = new Logger(AgendamentosService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Lista todos os agendamentos com filtros e dados consolidados
   */
  async findAll(filters: FilterAgendamentoDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(
        `(v.nome_completo ILIKE $${paramIndex} OR u.nome_completo ILIKE $${paramIndex} OR un.bloco ILIKE $${paramIndex} OR un.numero ILIKE $${paramIndex})`,
      );
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`ag.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.unidade_id) {
      conditions.push(`ag.unidade_id = $${paramIndex++}`);
      params.push(filters.unidade_id);
    }
    if (filters.visitante_id) {
      conditions.push(`ag.visitante_id = $${paramIndex++}`);
      params.push(filters.visitante_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agendamentos_visita ag 
      JOIN unidades un ON un.id = ag.unidade_id 
      JOIN visitantes v ON v.id = ag.visitante_id 
      JOIN usuarios u ON u.id = ag.usuario_solicitante_id 
      ${whereClause}
    `;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        ag.id,
        ag.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        ag.visitante_id,
        v.nome_completo as visitante_nome,
        v.cpf as visitante_cpf,
        v.foto_url as visitante_foto,
        v.tipo as visitante_tipo,
        v.empresa as visitante_empresa,
        v.placa_veiculo as visitante_placa,
        ag.usuario_solicitante_id,
        u.nome_completo as solicitante_nome,
        ag.usuario_autorizador_id,
        ua.nome_completo as autorizador_nome,
        ag.data_inicio,
        ag.data_fim,
        ag.status,
        ag.qr_code_hash,
        ag.observacoes,
        ag.entrada_realizada_em,
        ag.saida_realizada_em,
        ag.created_at,
        ag.updated_at
      FROM agendamentos_visita ag
      JOIN unidades un ON un.id = ag.unidade_id
      JOIN visitantes v ON v.id = ag.visitante_id
      JOIN usuarios u ON u.id = ag.usuario_solicitante_id
      LEFT JOIN usuarios ua ON ua.id = ag.usuario_autorizador_id
      ${whereClause}
      ORDER BY 
        CASE WHEN ag.status IN ('AGENDADO', 'AUTORIZADO', 'EM_ANDAMENTO') THEN 0 ELSE 1 END,
        ag.data_inicio DESC
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
   * Busca detalhes de agendamento por ID
   */
  async findOne(id: string): Promise<any> {
    const query = `
      SELECT 
        ag.id,
        ag.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        ag.visitante_id,
        v.nome_completo as visitante_nome,
        v.cpf as visitante_cpf,
        v.foto_url as visitante_foto,
        v.tipo as visitante_tipo,
        v.empresa as visitante_empresa,
        v.placa_veiculo as visitante_placa,
        ag.usuario_solicitante_id,
        u.nome_completo as solicitante_nome,
        ag.usuario_autorizador_id,
        ua.nome_completo as autorizador_nome,
        ag.data_inicio,
        ag.data_fim,
        ag.status,
        ag.qr_code_hash,
        ag.observacoes,
        ag.entrada_realizada_em,
        ag.saida_realizada_em,
        ag.created_at,
        ag.updated_at
      FROM agendamentos_visita ag
      JOIN unidades un ON un.id = ag.unidade_id
      JOIN visitantes v ON v.id = ag.visitante_id
      JOIN usuarios u ON u.id = ag.usuario_solicitante_id
      LEFT JOIN usuarios ua ON ua.id = ag.usuario_autorizador_id
      WHERE ag.id = $1
    `;
    const res = await this.databaseService.query(query, [id]);

    if (res.rowCount === 0) {
      throw new NotFoundException(`Agendamento com ID '${id}' não encontrado.`);
    }

    return res.rows[0];
  }

  /**
   * Busca agendamento pelo hash do QR Code
   */
  async findByQrCode(qrHash: string): Promise<any> {
    const query = `
      SELECT 
        ag.id,
        ag.status,
        ag.data_inicio,
        ag.data_fim,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        v.nome_completo as visitante_nome,
        v.foto_url as visitante_foto,
        v.tipo as visitante_tipo
      FROM agendamentos_visita ag
      JOIN unidades un ON un.id = ag.unidade_id
      JOIN visitantes v ON v.id = ag.visitante_id
      WHERE ag.qr_code_hash = $1
    `;
    const res = await this.databaseService.query(query, [qrHash]);
    if (res.rowCount === 0) {
      throw new NotFoundException('QR Code inválido ou agendamento não encontrado.');
    }
    return res.rows[0];
  }

  /**
   * Cria novo agendamento de visita com hash criptográfico SHA-256
   */
  async create(dto: CreateAgendamentoDto, solicitanteId: string, context?: LgpdContext): Promise<any> {
    const dataInicio = new Date(dto.data_inicio);
    const dataFim = new Date(dto.data_fim);

    if (dataFim <= dataInicio) {
      throw new BadRequestException('A data/hora de término deve ser posterior ao início.');
    }

    // Gera token seguro e hash SHA-256 para o QR Code
    const rawToken = `QR-${solicitanteId.substring(0, 4)}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const qrHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const insertQuery = `
      INSERT INTO agendamentos_visita (
        unidade_id,
        visitante_id,
        usuario_solicitante_id,
        usuario_autorizador_id,
        data_inicio,
        data_fim,
        status,
        qr_code_hash,
        observacoes
      ) VALUES ($1, $2, $3, $3, $4, $5, 'AUTORIZADO', $6, $7)
      RETURNING id
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.unidade_id,
        dto.visitante_id,
        solicitanteId,
        dataInicio,
        dataFim,
        qrHash,
        dto.observacoes || null,
      ],
      {
        ...context,
        userId: solicitanteId,
        reason: 'Criação de agendamento de visita/acesso',
      },
    );

    const novoAgendamento = await this.findOne(res.rows[0].id);

    try {
      this.eventsGateway.emitNewSchedule(novoAgendamento);
    } catch (e) {
      this.logger.warn(`Não foi possível emitir WebSocket de novo agendamento: ${e.message}`);
    }

    return {
      ...novoAgendamento,
      qr_code_raw: rawToken,
    };
  }

  /**
   * Registra a entrada do visitante na portaria
   */
  async registrarEntrada(id: string, porteiroId: string, context?: LgpdContext): Promise<any> {
    const ag = await this.findOne(id);
    if (ag.status === 'EM_ANDAMENTO' || ag.entrada_realizada_em) {
      throw new BadRequestException('Entrada já registrada para este agendamento.');
    }

    const updateQuery = `
      UPDATE agendamentos_visita
      SET 
        status = 'EM_ANDAMENTO',
        entrada_realizada_em = clock_timestamp(),
        porteiro_entrada_id = $1,
        updated_at = clock_timestamp()
      WHERE id = $2
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(updateQuery, [porteiroId, id], {
      ...context,
      userId: porteiroId,
      reason: `Registro de entrada de visitante: ${ag.visitante_nome}`,
    });

    const atualizado = await this.findOne(id);
    try {
      this.eventsGateway.emitScheduleStatusChange(id, 'EM_ANDAMENTO');
    } catch (e) {
      this.logger.warn(`Erro ao emitir evento de entrada: ${e.message}`);
    }

    return atualizado;
  }

  /**
   * Registra a saída do visitante na portaria
   */
  async registrarSaida(id: string, porteiroId: string, context?: LgpdContext): Promise<any> {
    const ag = await this.findOne(id);
    if (ag.status === 'CONCLUIDO' || ag.saida_realizada_em) {
      throw new BadRequestException('Saída já registrada para este agendamento.');
    }

    const updateQuery = `
      UPDATE agendamentos_visita
      SET 
        status = 'CONCLUIDO',
        saida_realizada_em = clock_timestamp(),
        porteiro_saida_id = $1,
        updated_at = clock_timestamp()
      WHERE id = $2
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(updateQuery, [porteiroId, id], {
      ...context,
      userId: porteiroId,
      reason: `Registro de saída de visitante: ${ag.visitante_nome}`,
    });

    const atualizado = await this.findOne(id);
    try {
      this.eventsGateway.emitScheduleStatusChange(id, 'CONCLUIDO');
    } catch (e) {
      this.logger.warn(`Erro ao emitir evento de saída: ${e.message}`);
    }

    return atualizado;
  }

  /**
   * Cancelamento de agendamento
   */
  async cancelar(id: string, context?: LgpdContext): Promise<any> {
    await this.findOne(id);
    const updateQuery = `
      UPDATE agendamentos_visita
      SET status = 'CANCELADO', updated_at = clock_timestamp()
      WHERE id = $1
      RETURNING id
    `;
    await this.databaseService.queryWithLgpdContext(updateQuery, [id], {
      ...context,
      reason: 'Cancelamento de agendamento de visita',
    });
    return this.findOne(id);
  }
}
