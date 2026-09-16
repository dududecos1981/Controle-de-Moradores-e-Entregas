import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateUnidadeDto, UpdateUnidadeDto } from './dto/create-unidade.dto';
import { FilterUnidadeDto, UnidadeResponseDto } from './dto/filter-unidade.dto';

@Injectable()
export class UnidadesService {
  private readonly logger = new Logger(UnidadesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Lista unidades com paginação e contagem de moradores
   */
  async findAll(filters: FilterUnidadeDto): Promise<{ data: UnidadeResponseDto[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.bloco) {
      conditions.push(`u.bloco ILIKE $${paramIndex++}`);
      params.push(`%${filters.bloco}%`);
    }
    if (filters.numero) {
      conditions.push(`u.numero ILIKE $${paramIndex++}`);
      params.push(`%${filters.numero}%`);
    }
    if (filters.tipo) {
      conditions.push(`u.tipo = $${paramIndex++}`);
      params.push(filters.tipo);
    }
    if (filters.status) {
      conditions.push(`u.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM unidades u ${whereClause}`;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        u.id,
        u.bloco,
        u.numero,
        u.tipo,
        u.status,
        u.andar,
        u.observacoes,
        u.created_at,
        u.updated_at,
        COUNT(usr.id) FILTER (WHERE usr.status = 'ATIVO' AND usr.lgpd_anonimizado = FALSE)::INTEGER as total_moradores
      FROM unidades u
      LEFT JOIN usuarios usr ON usr.unidade_id = u.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.bloco ASC, u.numero ASC
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
   * Busca unidade por ID com moradores relacionados
   */
  async findOne(id: string): Promise<any> {
    const query = `
      SELECT 
        u.id,
        u.bloco,
        u.numero,
        u.tipo,
        u.status,
        u.andar,
        u.observacoes,
        u.created_at,
        u.updated_at
      FROM unidades u
      WHERE u.id = $1
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rowCount === 0) {
      throw new NotFoundException(`Unidade com ID '${id}' não encontrada.`);
    }

    // Busca moradores associados
    const moradoresQuery = `
      SELECT id, nome_completo, email, telefone, perfil, is_responsavel_unidade
      FROM usuarios
      WHERE unidade_id = $1 AND status = 'ATIVO' AND lgpd_anonimizado = FALSE
      ORDER BY is_responsavel_unidade DESC, nome_completo ASC
    `;
    const moradores = await this.databaseService.query(moradoresQuery, [id]);

    return {
      ...result.rows[0],
      moradores: moradores.rows,
    };
  }

  /**
   * Criação de nova unidade com contexto LGPD
   */
  async create(dto: CreateUnidadeDto, context?: LgpdContext): Promise<UnidadeResponseDto> {
    const checkQuery = `SELECT id FROM unidades WHERE bloco = $1 AND numero = $2`;
    const checkRes = await this.databaseService.query(checkQuery, [dto.bloco, dto.numero]);
    if (checkRes.rowCount > 0) {
      throw new ConflictException(`Já existe uma unidade cadastrada no Bloco '${dto.bloco}' com o Número '${dto.numero}'.`);
    }

    const insertQuery = `
      INSERT INTO unidades (bloco, numero, tipo, status, andar, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.bloco,
        dto.numero,
        dto.tipo || 'APARTAMENTO',
        dto.status || 'ATIVO',
        dto.andar || null,
        dto.observacoes || null,
      ],
      {
        ...context,
        reason: 'Criação de unidade residencial/comercial',
      },
    );

    return res.rows[0];
  }

  /**
   * Atualização de unidade
   */
  async update(id: string, dto: UpdateUnidadeDto, context?: LgpdContext): Promise<UnidadeResponseDto> {
    await this.findOne(id); // Garante existência

    if (dto.bloco || dto.numero) {
      const checkQuery = `SELECT id FROM unidades WHERE bloco = $1 AND numero = $2 AND id != $3`;
      const checkRes = await this.databaseService.query(checkQuery, [dto.bloco, dto.numero, id]);
      if (checkRes.rowCount > 0) {
        throw new ConflictException(`Conflito: Bloco '${dto.bloco}' e Número '${dto.numero}' já pertencem a outra unidade.`);
      }
    }

    const updates: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (dto.bloco !== undefined) {
      updates.push(`bloco = $${paramIndex++}`);
      params.push(dto.bloco);
    }
    if (dto.numero !== undefined) {
      updates.push(`numero = $${paramIndex++}`);
      params.push(dto.numero);
    }
    if (dto.tipo !== undefined) {
      updates.push(`tipo = $${paramIndex++}`);
      params.push(dto.tipo);
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(dto.status);
    }
    if (dto.andar !== undefined) {
      updates.push(`andar = $${paramIndex++}`);
      params.push(dto.andar);
    }
    if (dto.observacoes !== undefined) {
      updates.push(`observacoes = $${paramIndex++}`);
      params.push(dto.observacoes);
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    const query = `
      UPDATE unidades
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const res = await this.databaseService.queryWithLgpdContext(query, params, {
      ...context,
      reason: 'Atualização de dados da unidade',
    });

    return res.rows[0];
  }

  /**
   * Exclusão de unidade (bloqueia se houver moradores ou entregas ativas)
   */
  async remove(id: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    const deleteQuery = `DELETE FROM unidades WHERE id = $1`;
    await this.databaseService.queryWithLgpdContext(deleteQuery, [id], {
      ...context,
      reason: 'Exclusão de unidade',
    });

    return { success: true, message: 'Unidade removida com sucesso.' };
  }
}
