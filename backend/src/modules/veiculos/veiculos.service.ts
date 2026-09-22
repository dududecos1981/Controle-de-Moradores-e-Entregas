import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateVeiculoDto, UpdateVeiculoDto } from './dto/create-veiculo.dto';
import { FilterVeiculoDto } from './dto/filter-veiculo.dto';

@Injectable()
export class VeiculosService {
  private readonly logger = new Logger(VeiculosService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Lista veículos com filtros e paginação
   */
  async findAll(filters: FilterVeiculoDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(
        `(v.placa ILIKE $${paramIndex} OR v.marca_modelo ILIKE $${paramIndex} OR v.vaga_garagem ILIKE $${paramIndex} OR u.nome_completo ILIKE $${paramIndex} OR un.bloco ILIKE $${paramIndex} OR un.numero ILIKE $${paramIndex})`,
      );
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.placa) {
      conditions.push(`v.placa ILIKE $${paramIndex++}`);
      params.push(`%${filters.placa}%`);
    }
    if (filters.unidade_id) {
      conditions.push(`v.unidade_id = $${paramIndex++}`);
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
    if (filters.tipo) {
      conditions.push(`v.tipo = $${paramIndex++}`);
      params.push(filters.tipo);
    }
    if (filters.ativo !== undefined) {
      conditions.push(`v.ativo = $${paramIndex++}`);
      params.push(filters.ativo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM veiculos v
      JOIN unidades un ON un.id = v.unidade_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      ${whereClause}
    `;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        v.id,
        v.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        v.usuario_id,
        u.nome_completo as proprietario_nome,
        u.telefone as proprietario_telefone,
        v.placa,
        v.marca_modelo,
        v.cor,
        v.tipo,
        v.vaga_garagem,
        v.ativo,
        v.observacoes,
        v.created_at,
        v.updated_at
      FROM veiculos v
      JOIN unidades un ON un.id = v.unidade_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      ${whereClause}
      ORDER BY un.bloco ASC, un.numero ASC, v.placa ASC
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
   * Busca veículo por ID
   */
  async findOne(id: string): Promise<any> {
    const query = `
      SELECT 
        v.id,
        v.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        v.usuario_id,
        u.nome_completo as proprietario_nome,
        u.telefone as proprietario_telefone,
        u.email as proprietario_email,
        v.placa,
        v.marca_modelo,
        v.cor,
        v.tipo,
        v.vaga_garagem,
        v.ativo,
        v.observacoes,
        v.created_at,
        v.updated_at
      FROM veiculos v
      JOIN unidades un ON un.id = v.unidade_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.id = $1
    `;
    const res = await this.databaseService.query(query, [id]);

    if (res.rowCount === 0) {
      throw new NotFoundException(`Veículo com ID '${id}' não encontrado.`);
    }

    return res.rows[0];
  }

  /**
   * Busca rápida de veículo por placa exata
   */
  async findByPlaca(placa: string): Promise<any> {
    const formatted = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const query = `
      SELECT 
        v.id,
        v.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        v.usuario_id,
        u.nome_completo as proprietario_nome,
        u.telefone as proprietario_telefone,
        v.placa,
        v.marca_modelo,
        v.cor,
        v.tipo,
        v.vaga_garagem,
        v.ativo,
        v.observacoes
      FROM veiculos v
      JOIN unidades un ON un.id = v.unidade_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE UPPER(REPLACE(v.placa, '-', '')) = $1
    `;
    const res = await this.databaseService.query(query, [formatted]);

    if (res.rowCount === 0) {
      return null;
    }

    return res.rows[0];
  }

  /**
   * Cadastra novo veículo
   */
  async create(dto: CreateVeiculoDto, context?: LgpdContext): Promise<any> {
    const placaClean = dto.placa.trim().toUpperCase();

    // Verifica se a placa já existe
    const exists = await this.databaseService.query(
      `SELECT id FROM veiculos WHERE UPPER(REPLACE(placa, '-', '')) = UPPER(REPLACE($1, '-', ''))`,
      [placaClean],
    );
    if (exists.rowCount > 0) {
      throw new ConflictException(`Já existe um veículo cadastrado com a placa '${placaClean}'.`);
    }

    // Valida unidade
    const unidade = await this.databaseService.query(
      `SELECT id FROM unidades WHERE id = $1 AND status = 'ATIVO'`,
      [dto.unidade_id],
    );
    if (unidade.rowCount === 0) {
      throw new BadRequestException('Unidade informada não encontrada ou inativa.');
    }

    const insertQuery = `
      INSERT INTO veiculos (
        unidade_id,
        usuario_id,
        placa,
        marca_modelo,
        cor,
        tipo,
        vaga_garagem,
        ativo,
        observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.unidade_id,
        dto.usuario_id || null,
        placaClean,
        dto.marca_modelo,
        dto.cor || null,
        dto.tipo || 'CARRO',
        dto.vaga_garagem || null,
        dto.ativo !== undefined ? dto.ativo : true,
        dto.observacoes || null,
      ],
      {
        ...context,
        reason: 'Cadastro de veículo de morador/unidade',
      },
    );

    return this.findOne(res.rows[0].id);
  }

  /**
   * Atualiza dados do veículo
   */
  async update(id: string, dto: UpdateVeiculoDto, context?: LgpdContext): Promise<any> {
    await this.findOne(id);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.unidade_id) {
      fields.push(`unidade_id = $${idx++}`);
      values.push(dto.unidade_id);
    }
    if (dto.usuario_id !== undefined) {
      fields.push(`usuario_id = $${idx++}`);
      values.push(dto.usuario_id || null);
    }
    if (dto.placa) {
      const placaClean = dto.placa.trim().toUpperCase();
      fields.push(`placa = $${idx++}`);
      values.push(placaClean);
    }
    if (dto.marca_modelo) {
      fields.push(`marca_modelo = $${idx++}`);
      values.push(dto.marca_modelo);
    }
    if (dto.cor !== undefined) {
      fields.push(`cor = $${idx++}`);
      values.push(dto.cor);
    }
    if (dto.tipo) {
      fields.push(`tipo = $${idx++}`);
      values.push(dto.tipo);
    }
    if (dto.vaga_garagem !== undefined) {
      fields.push(`vaga_garagem = $${idx++}`);
      values.push(dto.vaga_garagem);
    }
    if (dto.ativo !== undefined) {
      fields.push(`ativo = $${idx++}`);
      values.push(dto.ativo);
    }
    if (dto.observacoes !== undefined) {
      fields.push(`observacoes = $${idx++}`);
      values.push(dto.observacoes);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    values.push(id);
    const query = `
      UPDATE veiculos
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id
    `;

    await this.databaseService.queryWithLgpdContext(query, values, {
      ...context,
      reason: 'Atualização cadastral de veículo',
    });

    return this.findOne(id);
  }

  /**
   * Remove veículo
   */
  async remove(id: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.databaseService.queryWithLgpdContext(
      `DELETE FROM veiculos WHERE id = $1`,
      [id],
      {
        ...context,
        reason: 'Remoção de veículo cadastrado',
      },
    );

    return {
      success: true,
      message: 'Veículo removido com sucesso.',
    };
  }
}
