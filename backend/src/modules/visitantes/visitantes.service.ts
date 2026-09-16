import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateVisitanteDto, UpdateVisitanteDto } from './dto/create-visitante.dto';
import { FilterVisitanteDto, VisitanteResponseDto } from './dto/filter-visitante.dto';

@Injectable()
export class VisitantesService {
  private readonly logger = new Logger(VisitantesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Lista visitantes com filtros avançados e paginação
   */
  async findAll(filters: FilterVisitanteDto): Promise<{ data: VisitanteResponseDto[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['v.lgpd_anonimizado = FALSE'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(
        `(v.nome_completo ILIKE $${paramIndex} OR v.cpf ILIKE $${paramIndex} OR v.rg ILIKE $${paramIndex} OR v.empresa ILIKE $${paramIndex} OR v.placa_veiculo ILIKE $${paramIndex})`,
      );
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.cpf) {
      conditions.push(`v.cpf = $${paramIndex++}`);
      params.push(filters.cpf);
    }
    if (filters.placa_veiculo) {
      conditions.push(`v.placa_veiculo ILIKE $${paramIndex++}`);
      params.push(`%${filters.placa_veiculo}%`);
    }
    if (filters.tipo) {
      conditions.push(`v.tipo = $${paramIndex++}`);
      params.push(filters.tipo);
    }
    if (filters.ativo !== undefined) {
      conditions.push(`v.ativo = $${paramIndex++}`);
      params.push(filters.ativo);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) as total FROM visitantes v ${whereClause}`;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        v.id,
        v.nome_completo,
        v.cpf,
        v.rg,
        v.telefone,
        v.foto_url,
        v.tipo,
        v.empresa,
        v.placa_veiculo,
        v.ativo,
        v.observacoes,
        v.created_at,
        v.updated_at,
        COUNT(ag.id)::INTEGER as total_visitas
      FROM visitantes v
      LEFT JOIN agendamentos_visita ag ON ag.visitante_id = v.id
      ${whereClause}
      GROUP BY v.id
      ORDER BY v.nome_completo ASC
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
   * Busca visitante por ID com histórico recente de agendamentos
   */
  async findOne(id: string): Promise<any> {
    const query = `
      SELECT 
        v.id,
        v.nome_completo,
        v.cpf,
        v.rg,
        v.telefone,
        v.foto_url,
        v.tipo,
        v.empresa,
        v.placa_veiculo,
        v.ativo,
        v.observacoes,
        v.created_at,
        v.updated_at
      FROM visitantes v
      WHERE v.id = $1
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rowCount === 0) {
      throw new NotFoundException(`Visitante com ID '${id}' não encontrado.`);
    }

    // Histórico de visitas recentes
    const historicoQuery = `
      SELECT 
        ag.id,
        ag.data_inicio,
        ag.data_fim,
        ag.status,
        ag.entrada_realizada_em,
        ag.saida_realizada_em,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        u.nome_completo as solicitante_nome
      FROM agendamentos_visita ag
      JOIN unidades un ON un.id = ag.unidade_id
      JOIN usuarios u ON u.id = ag.usuario_solicitante_id
      WHERE ag.visitante_id = $1
      ORDER BY ag.data_inicio DESC
      LIMIT 10
    `;
    const historico = await this.databaseService.query(historicoQuery, [id]);

    return {
      ...result.rows[0],
      historico_visitas: historico.rows,
    };
  }

  /**
   * Cadastro de novo visitante
   */
  async create(dto: CreateVisitanteDto, context?: LgpdContext): Promise<VisitanteResponseDto> {
    if (!dto.cpf && !dto.rg) {
      throw new BadRequestException('É obrigatório informar ao menos um documento de identificação (CPF ou RG).');
    }

    const insertQuery = `
      INSERT INTO visitantes (
        nome_completo,
        cpf,
        rg,
        telefone,
        foto_url,
        tipo,
        empresa,
        placa_veiculo,
        observacoes,
        ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.nome_completo,
        dto.cpf || null,
        dto.rg || null,
        dto.telefone || null,
        dto.foto_url || null,
        dto.tipo || 'VISITANTE',
        dto.empresa || null,
        dto.placa_veiculo ? dto.placa_veiculo.toUpperCase() : null,
        dto.observacoes || null,
        dto.ativo !== undefined ? dto.ativo : true,
      ],
      {
        ...context,
        reason: 'Cadastro de visitante/prestador na portaria',
      },
    );

    return res.rows[0];
  }

  /**
   * Atualização cadastral de visitante
   */
  async update(id: string, dto: UpdateVisitanteDto, context?: LgpdContext): Promise<VisitanteResponseDto> {
    await this.findOne(id);

    const updates: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (dto.nome_completo !== undefined) {
      updates.push(`nome_completo = $${paramIndex++}`);
      params.push(dto.nome_completo);
    }
    if (dto.cpf !== undefined) {
      updates.push(`cpf = $${paramIndex++}`);
      params.push(dto.cpf);
    }
    if (dto.rg !== undefined) {
      updates.push(`rg = $${paramIndex++}`);
      params.push(dto.rg);
    }
    if (dto.telefone !== undefined) {
      updates.push(`telefone = $${paramIndex++}`);
      params.push(dto.telefone);
    }
    if (dto.foto_url !== undefined) {
      updates.push(`foto_url = $${paramIndex++}`);
      params.push(dto.foto_url);
    }
    if (dto.tipo !== undefined) {
      updates.push(`tipo = $${paramIndex++}`);
      params.push(dto.tipo);
    }
    if (dto.empresa !== undefined) {
      updates.push(`empresa = $${paramIndex++}`);
      params.push(dto.empresa);
    }
    if (dto.placa_veiculo !== undefined) {
      updates.push(`placa_veiculo = $${paramIndex++}`);
      params.push(dto.placa_veiculo ? dto.placa_veiculo.toUpperCase() : null);
    }
    if (dto.observacoes !== undefined) {
      updates.push(`observacoes = $${paramIndex++}`);
      params.push(dto.observacoes);
    }
    if (dto.ativo !== undefined) {
      updates.push(`ativo = $${paramIndex++}`);
      params.push(dto.ativo);
    }

    if (updates.length > 0) {
      const query = `
        UPDATE visitantes
        SET ${updates.join(', ')}
        WHERE id = $1
      `;
      await this.databaseService.queryWithLgpdContext(query, params, {
        ...context,
        reason: 'Atualização cadastral de visitante',
      });
    }

    return this.findOne(id);
  }

  /**
   * Remoção de visitante
   */
  async remove(id: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    const deleteQuery = `DELETE FROM visitantes WHERE id = $1`;
    await this.databaseService.queryWithLgpdContext(deleteQuery, [id], {
      ...context,
      reason: 'Exclusão de visitante da base',
    });

    return { success: true, message: 'Visitante removido com sucesso.' };
  }
}
