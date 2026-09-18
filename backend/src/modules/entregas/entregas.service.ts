import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { FilterEntregaDto } from './dto/filter-entrega.dto';
import { RetirarEntregaDto } from './dto/retirar-entrega.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class EntregasService {
  private readonly logger = new Logger(EntregasService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Lista entregas com paginação e filtros detalhados
   */
  async findAll(filters: FilterEntregaDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(
        `(e.codigo_barras_qrcode ILIKE $${paramIndex} OR e.codigo_rastreio ILIKE $${paramIndex} OR e.transportadora ILIKE $${paramIndex} OR e.descricao_pacote ILIKE $${paramIndex} OR u.nome_completo ILIKE $${paramIndex} OR e.retirado_por_nome ILIKE $${paramIndex})`,
      );
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`e.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.unidade_id) {
      conditions.push(`e.unidade_id = $${paramIndex++}`);
      params.push(filters.unidade_id);
    }
    if (filters.bloco) {
      conditions.push(`un.bloco ILIKE $${paramIndex++}`);
      params.push(`%${filters.bloco}%`);
    }
    if (filters.numero) {
      conditions.push(`un.numero ILIKE $${paramIndex++}`);
      params.push(`%${filters.numero}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM entregas e 
      JOIN unidades un ON un.id = e.unidade_id 
      LEFT JOIN usuarios u ON u.id = e.usuario_destinatario_id 
      ${whereClause}
    `;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        e.id,
        e.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        e.usuario_destinatario_id,
        u.nome_completo as destinatario_nome,
        u.telefone as destinatario_telefone,
        e.porteiro_recebedor_id,
        pr.nome_completo as porteiro_recebedor_nome,
        e.porteiro_entregador_id,
        pe.nome_completo as porteiro_entregador_nome,
        e.codigo_barras_qrcode,
        e.transportadora,
        e.codigo_rastreio,
        e.descricao_pacote,
        e.foto_comprovante_url,
        e.foto_retirada_url,
        e.status,
        e.data_recebimento,
        e.data_retirada,
        e.retirado_por_nome,
        e.retirado_por_documento,
        e.notificado_morador,
        e.notificado_em,
        e.created_at,
        e.updated_at
      FROM entregas e
      JOIN unidades un ON un.id = e.unidade_id
      LEFT JOIN usuarios u ON u.id = e.usuario_destinatario_id
      LEFT JOIN usuarios pr ON pr.id = e.porteiro_recebedor_id
      LEFT JOIN usuarios pe ON pe.id = e.porteiro_entregador_id
      ${whereClause}
      ORDER BY 
        CASE WHEN e.status = 'AGUARDANDO_RETIRADA' THEN 0 ELSE 1 END,
        e.data_recebimento DESC
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
   * Busca detalhes de uma entrega por ID
   */
  async findOne(id: string): Promise<any> {
    const query = `
      SELECT 
        e.id,
        e.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        e.usuario_destinatario_id,
        u.nome_completo as destinatario_nome,
        u.telefone as destinatario_telefone,
        u.email as destinatario_email,
        e.porteiro_recebedor_id,
        pr.nome_completo as porteiro_recebedor_nome,
        e.porteiro_entregador_id,
        pe.nome_completo as porteiro_entregador_nome,
        e.codigo_barras_qrcode,
        e.transportadora,
        e.codigo_rastreio,
        e.descricao_pacote,
        e.foto_comprovante_url,
        e.foto_retirada_url,
        e.status,
        e.data_recebimento,
        e.data_retirada,
        e.retirado_por_nome,
        e.retirado_por_documento,
        e.notificado_morador,
        e.notificado_em,
        e.created_at,
        e.updated_at
      FROM entregas e
      JOIN unidades un ON un.id = e.unidade_id
      LEFT JOIN usuarios u ON u.id = e.usuario_destinatario_id
      LEFT JOIN usuarios pr ON pr.id = e.porteiro_recebedor_id
      LEFT JOIN usuarios pe ON pe.id = e.porteiro_entregador_id
      WHERE e.id = $1
    `;
    const res = await this.databaseService.query(query, [id]);

    if (res.rowCount === 0) {
      throw new NotFoundException(`Entrega com ID '${id}' não encontrada.`);
    }

    return res.rows[0];
  }

  /**
   * Registra o recebimento de uma nova entrega na portaria
   */
  async create(dto: CreateEntregaDto, porteiroId: string, context?: LgpdContext): Promise<any> {
    // Valida existência da unidade
    const unidadeRes = await this.databaseService.query(
      `SELECT id, bloco, numero FROM unidades WHERE id = $1 AND status = 'ATIVO'`,
      [dto.unidade_id],
    );
    if (unidadeRes.rowCount === 0) {
      throw new BadRequestException('Unidade de destino não encontrada ou inativa.');
    }

    // Se destinatário foi informado, valida vínculo
    let destinatarioId = dto.usuario_destinatario_id || null;
    if (!destinatarioId) {
      // Auto-associa com o responsável titular da unidade se houver
      const titularRes = await this.databaseService.query(
        `SELECT id FROM usuarios WHERE unidade_id = $1 AND status = 'ATIVO' AND is_responsavel_unidade = TRUE LIMIT 1`,
        [dto.unidade_id],
      );
      if (titularRes.rowCount > 0) {
        destinatarioId = titularRes.rows[0].id;
      }
    }

    const insertQuery = `
      INSERT INTO entregas (
        unidade_id,
        usuario_destinatario_id,
        porteiro_recebedor_id,
        codigo_barras_qrcode,
        transportadora,
        codigo_rastreio,
        descricao_pacote,
        foto_comprovante_url,
        status,
        data_recebimento,
        notificado_morador,
        notificado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'AGUARDANDO_RETIRADA', clock_timestamp(), TRUE, clock_timestamp())
      RETURNING id
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.unidade_id,
        destinatarioId,
        porteiroId,
        dto.codigo_barras_qrcode,
        dto.transportadora || null,
        dto.codigo_rastreio || null,
        dto.descricao_pacote || null,
        dto.foto_comprovante_url || null,
      ],
      {
        ...context,
        userId: porteiroId,
        reason: 'Recebimento de pacote/encomenda na portaria',
      },
    );

    const novaEntrega = await this.findOne(res.rows[0].id);

    // Emite evento WebSocket em tempo real para os painéis Web e Mobile
    try {
      this.eventsGateway.emitNewPackage(novaEntrega);
    } catch (e) {
      this.logger.warn(`Não foi possível emitir WebSocket de nova entrega: ${e.message}`);
    }

    return novaEntrega;
  }

  /**
   * Baixa e retirada de encomenda pelo morador ou portador autorizado
   */
  async retirar(id: string, dto: RetirarEntregaDto, porteiroId: string, context?: LgpdContext): Promise<any> {
    const entrega = await this.findOne(id);
    if (entrega.status === 'RETIRADO') {
      throw new BadRequestException('Esta entrega já foi retirada anteriormente.');
    }

    const updateQuery = `
      UPDATE entregas
      SET 
        status = 'RETIRADO',
        data_retirada = clock_timestamp(),
        retirado_por_nome = $1,
        retirado_por_documento = $2,
        foto_retirada_url = $3,
        porteiro_entregador_id = $4,
        updated_at = clock_timestamp()
      WHERE id = $5
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(
      updateQuery,
      [
        dto.retirado_por_nome,
        dto.retirado_por_documento || null,
        dto.foto_retirada_url || null,
        porteiroId,
        id,
      ],
      {
        ...context,
        userId: porteiroId,
        reason: `Baixa de entrega para: ${dto.retirado_por_nome}`,
      },
    );

    const entregaAtualizada = await this.findOne(id);

    try {
      this.eventsGateway.emitPackageStatusChange(id, 'RETIRADO');
    } catch (e) {
      this.logger.warn(`Não foi possível emitir WebSocket de entrega retirada: ${e.message}`);
    }

    return entregaAtualizada;
  }

  /**
   * Métricas e totais para o dashboard
   */
  async getDashboardMetrics(): Promise<{
    total: number;
    aguardandoRetirada: number;
    retiradasHoje: number;
  }> {
    const query = `
      SELECT 
        COUNT(*)::INTEGER as total,
        COUNT(*) FILTER (WHERE status = 'AGUARDANDO_RETIRADA')::INTEGER as aguardando_retirada,
        COUNT(*) FILTER (WHERE status = 'RETIRADO' AND data_retirada >= CURRENT_DATE)::INTEGER as retiradas_hoje
      FROM entregas
    `;
    const res = await this.databaseService.query(query);
    const row = res.rows[0] || {};

    return {
      total: row.total || 0,
      aguardandoRetirada: row.aguardando_retirada || 0,
      retiradasHoje: row.retiradas_hoje || 0,
    };
  }

  /**
   * Exclusão de registro de entrega
   */
  async remove(id: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.databaseService.queryWithLgpdContext(
      `DELETE FROM entregas WHERE id = $1`,
      [id],
      {
        ...context,
        reason: 'Exclusão de registro de entrega',
      },
    );
    return { success: true, message: 'Registro de entrega removido com sucesso.' };
  }
}
