import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService, LgpdContext } from '../../database/database.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
import { FilterUsuarioDto, UsuarioResponseDto } from './dto/filter-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Lista usuários com paginação, filtros e informações de unidade vinculada
   */
  async findAll(filters: FilterUsuarioDto): Promise<{ data: UsuarioResponseDto[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['u.lgpd_anonimizado = FALSE'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(`(u.nome_completo ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.cpf ILIKE $${paramIndex})`);
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.cpf) {
      conditions.push(`u.cpf = $${paramIndex++}`);
      params.push(filters.cpf);
    }
    if (filters.perfil) {
      conditions.push(`u.perfil = $${paramIndex++}`);
      params.push(filters.perfil);
    }
    if (filters.status) {
      conditions.push(`u.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.unidade_id) {
      conditions.push(`u.unidade_id = $${paramIndex++}`);
      params.push(filters.unidade_id);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) as total FROM usuarios u ${whereClause}`;
    const countRes = await this.databaseService.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const query = `
      SELECT 
        u.id,
        u.nome_completo,
        u.cpf,
        u.email,
        u.telefone,
        u.perfil,
        u.status,
        u.is_responsavel_unidade,
        u.avatar_url,
        u.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        u.lgpd_termo_aceito,
        u.lgpd_anonimizado,
        u.created_at,
        u.updated_at
      FROM usuarios u
      LEFT JOIN unidades un ON un.id = u.unidade_id
      ${whereClause}
      ORDER BY u.nome_completo ASC
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
   * Detalhes de um usuário específico
   */
  async findOne(id: string): Promise<UsuarioResponseDto> {
    const query = `
      SELECT 
        u.id,
        u.nome_completo,
        u.cpf,
        u.email,
        u.telefone,
        u.perfil,
        u.status,
        u.is_responsavel_unidade,
        u.avatar_url,
        u.unidade_id,
        un.bloco as unidade_bloco,
        un.numero as unidade_numero,
        u.lgpd_termo_aceito,
        u.lgpd_anonimizado,
        u.created_at,
        u.updated_at
      FROM usuarios u
      LEFT JOIN unidades un ON un.id = u.unidade_id
      WHERE u.id = $1
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rowCount === 0) {
      throw new NotFoundException(`Usuário com ID '${id}' não encontrado.`);
    }

    return result.rows[0];
  }

  /**
   * Criação de usuário por gestor/administrador
   */
  async create(dto: CreateUsuarioDto, context?: LgpdContext): Promise<UsuarioResponseDto> {
    const checkQuery = `SELECT id, cpf, email FROM usuarios WHERE cpf = $1 OR email = $2`;
    const checkRes = await this.databaseService.query(checkQuery, [dto.cpf, dto.email]);
    if (checkRes.rowCount > 0) {
      const existing = checkRes.rows[0];
      if (existing.cpf === dto.cpf) throw new ConflictException('CPF já cadastrado no sistema.');
      if (existing.email === dto.email) throw new ConflictException('E-mail já cadastrado no sistema.');
    }

    if (dto.unidade_id) {
      const checkUnidade = await this.databaseService.query(`SELECT id FROM unidades WHERE id = $1`, [dto.unidade_id]);
      if (checkUnidade.rowCount === 0) {
        throw new BadRequestException('Unidade informada não existe.');
      }
    }

    const saltRounds = this.configService.get<number>('jwt.bcryptSaltRounds', 10);
    const senhaHash = await bcrypt.hash(dto.senha, saltRounds);

    const insertQuery = `
      INSERT INTO usuarios (
        nome_completo,
        cpf,
        email,
        senha_hash,
        telefone,
        perfil,
        status,
        is_responsavel_unidade,
        unidade_id,
        avatar_url,
        lgpd_termo_aceito,
        lgpd_data_aceite
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, clock_timestamp())
      RETURNING *
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.nome_completo,
        dto.cpf,
        dto.email,
        senhaHash,
        dto.telefone || null,
        dto.perfil || 'MORADOR',
        dto.status || 'ATIVO',
        dto.is_responsavel_unidade || false,
        dto.unidade_id || null,
        dto.avatar_url || null,
      ],
      {
        ...context,
        reason: 'Criação de usuário via painel administrativo',
      },
    );

    return this.findOne(res.rows[0].id);
  }

  /**
   * Atualização de dados do usuário
   */
  async update(id: string, dto: UpdateUsuarioDto, context?: LgpdContext): Promise<UsuarioResponseDto> {
    const existing = await this.findOne(id);

    if (dto.email && dto.email !== existing.email) {
      const checkEmail = await this.databaseService.query(
        `SELECT id FROM usuarios WHERE email = $1 AND id != $2`,
        [dto.email, id],
      );
      if (checkEmail.rowCount > 0) {
        throw new ConflictException('E-mail já utilizado por outro usuário.');
      }
    }

    const updates: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (dto.nome_completo !== undefined) {
      updates.push(`nome_completo = $${paramIndex++}`);
      params.push(dto.nome_completo);
    }
    if (dto.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(dto.email);
    }
    if (dto.senha) {
      const saltRounds = this.configService.get<number>('jwt.bcryptSaltRounds', 10);
      const senhaHash = await bcrypt.hash(dto.senha, saltRounds);
      updates.push(`senha_hash = $${paramIndex++}`);
      params.push(senhaHash);
    }
    if (dto.telefone !== undefined) {
      updates.push(`telefone = $${paramIndex++}`);
      params.push(dto.telefone);
    }
    if (dto.perfil !== undefined) {
      updates.push(`perfil = $${paramIndex++}`);
      params.push(dto.perfil);
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(dto.status);
    }
    if (dto.is_responsavel_unidade !== undefined) {
      updates.push(`is_responsavel_unidade = $${paramIndex++}`);
      params.push(dto.is_responsavel_unidade);
    }
    if (dto.unidade_id !== undefined) {
      updates.push(`unidade_id = $${paramIndex++}`);
      params.push(dto.unidade_id);
    }
    if (dto.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(dto.avatar_url);
    }

    if (updates.length > 0) {
      const query = `
        UPDATE usuarios
        SET ${updates.join(', ')}
        WHERE id = $1
      `;
      await this.databaseService.queryWithLgpdContext(query, params, {
        ...context,
        reason: 'Atualização cadastral de usuário',
      });
    }

    return this.findOne(id);
  }

  /**
   * Anonimização em conformidade com Art. 18 da LGPD
   */
  async anonimizarLgpd(id: string, motivo: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    // Executa a procedure criada na modelagem do banco (Passo 1)
    await this.databaseService.queryWithLgpdContext(
      `SELECT fn_anonimizar_usuario_lgpd($1, $2)`,
      [id, motivo],
      {
        ...context,
        reason: `Anonimização LGPD: ${motivo}`,
      },
    );

    this.logger.warn(`Usuário ${id} anonimizado com sucesso conforme LGPD Art. 18.`);
    return { success: true, message: 'Dados do usuário anonimizados com sucesso.' };
  }

  /**
   * Exclusão ou desativação de usuário
   */
  async remove(id: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    const deleteQuery = `DELETE FROM usuarios WHERE id = $1`;
    await this.databaseService.queryWithLgpdContext(deleteQuery, [id], {
      ...context,
      reason: 'Exclusão definitiva de usuário',
    });

    return { success: true, message: 'Usuário removido com sucesso.' };
  }
}
