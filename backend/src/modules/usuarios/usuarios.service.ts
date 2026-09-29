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

  private normalizePerfil(perfil?: string): string {
    if (!perfil) return 'MORADOR';
    const p = perfil.toUpperCase().trim();
    if (p === 'GERENTE') return 'ADMINISTRADOR';
    if (p === 'ZELADOR') return 'PORTEIRO';
    if (['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO'].includes(p)) {
      return p;
    }
    return 'MORADOR';
  }

  /**
   * Resolve ou cria a unidade baseada em ID ou bloco + número
   */
  private async resolveUnidadeId(unidadeId?: string, bloco?: string, numero?: string): Promise<string | null> {
    if (unidadeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unidadeId)) {
      const check = await this.databaseService.query('SELECT id FROM unidades WHERE id = $1', [unidadeId]);
      if (check.rowCount > 0) return check.rows[0].id;
    }

    if (bloco && numero) {
      const cleanBloco = bloco.trim().toUpperCase();
      const cleanNumero = numero.trim().toUpperCase();
      const check = await this.databaseService.query(
        'SELECT id FROM unidades WHERE UPPER(bloco) = $1 AND UPPER(numero) = $2 LIMIT 1',
        [cleanBloco, cleanNumero],
      );
      if (check.rowCount > 0) {
        return check.rows[0].id;
      }
      const created = await this.databaseService.query(
        `INSERT INTO unidades (bloco, numero, tipo, status) VALUES ($1, $2, 'APARTAMENTO', 'ATIVO') RETURNING id`,
        [cleanBloco, cleanNumero],
      );
      return created.rows[0].id;
    }

    return null;
  }

  /**
   * Lista usuários com paginação, filtros e informações de unidade vinculada
   */
  async findAll(filters: FilterUsuarioDto): Promise<{ data: UsuarioResponseDto[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['u.lgpd_anonimizado = FALSE'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.busca) {
      conditions.push(`(u.nome_completo ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.cpf ILIKE $${paramIndex} OR un.bloco ILIKE $${paramIndex} OR un.numero ILIKE $${paramIndex})`);
      params.push(`%${filters.busca}%`);
      paramIndex++;
    }
    if (filters.cpf) {
      conditions.push(`u.cpf = $${paramIndex++}`);
      params.push(filters.cpf);
    }
    if (filters.perfil) {
      conditions.push(`u.perfil = $${paramIndex++}`);
      params.push(this.normalizePerfil(filters.perfil));
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

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios u 
      LEFT JOIN unidades un ON un.id = u.unidade_id
      ${whereClause}
    `;
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
   * Criação de usuário por gestor/administrador/porteiro
   */
  async create(dto: CreateUsuarioDto, context?: LgpdContext): Promise<UsuarioResponseDto> {
    const cleanCpf = (dto.cpf || '').trim();
    const cleanEmail = (dto.email || '').trim().toLowerCase();

    const checkQuery = `SELECT id, cpf, email FROM usuarios WHERE cpf = $1 OR LOWER(email) = $2`;
    const checkRes = await this.databaseService.query(checkQuery, [cleanCpf, cleanEmail]);
    if (checkRes.rowCount > 0) {
      const existing = checkRes.rows[0];
      if (existing.cpf === cleanCpf) throw new ConflictException('CPF já cadastrado no sistema.');
      if (existing.email.toLowerCase() === cleanEmail) throw new ConflictException('E-mail já cadastrado no sistema.');
    }

    const resolvedUnidadeId = await this.resolveUnidadeId(dto.unidade_id, dto.unidade_bloco, dto.unidade_numero);

    const rawPassword = dto.senha || cleanCpf.replace(/\D/g, '') || 'Mudar@123456';
    const saltRounds = this.configService.get<number>('jwt.bcryptSaltRounds', 10);
    const senhaHash = await bcrypt.hash(rawPassword, saltRounds);
    const perfilFinal = this.normalizePerfil(dto.perfil);

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
      RETURNING id
    `;

    const res = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.nome_completo.trim(),
        cleanCpf,
        cleanEmail,
        senhaHash,
        dto.telefone || null,
        perfilFinal,
        dto.status || 'ATIVO',
        dto.is_responsavel_unidade !== undefined ? dto.is_responsavel_unidade : true,
        resolvedUnidadeId,
        dto.avatar_url || null,
      ],
      {
        ...context,
        reason: 'Criação de usuário via sistema',
      },
    );

    return this.findOne(res.rows[0].id);
  }

  /**
   * Atualização de dados do usuário
   */
  async update(id: string, dto: UpdateUsuarioDto, context?: LgpdContext): Promise<UsuarioResponseDto> {
    const existing = await this.findOne(id);

    if (dto.email && dto.email.toLowerCase() !== existing.email.toLowerCase()) {
      const checkEmail = await this.databaseService.query(
        `SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1) AND id != $2`,
        [dto.email.trim(), id],
      );
      if (checkEmail.rowCount > 0) {
        throw new ConflictException('E-mail já utilizado por outro usuário.');
      }
    }

    const resolvedUnidadeId = await this.resolveUnidadeId(dto.unidade_id, dto.unidade_bloco, dto.unidade_numero);

    const updates: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (dto.nome_completo !== undefined) {
      updates.push(`nome_completo = $${paramIndex++}`);
      params.push(dto.nome_completo.trim());
    }
    if (dto.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(dto.email.trim().toLowerCase());
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
      params.push(this.normalizePerfil(dto.perfil));
    }
    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(dto.status);
    }
    if (dto.is_responsavel_unidade !== undefined) {
      updates.push(`is_responsavel_unidade = $${paramIndex++}`);
      params.push(dto.is_responsavel_unidade);
    }
    if (resolvedUnidadeId !== null || dto.unidade_id !== undefined) {
      updates.push(`unidade_id = $${paramIndex++}`);
      params.push(resolvedUnidadeId);
    }
    if (dto.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(dto.avatar_url);
    }

    updates.push(`updated_at = clock_timestamp()`);

    const query = `
      UPDATE usuarios
      SET ${updates.join(', ')}
      WHERE id = $1
    `;
    await this.databaseService.queryWithLgpdContext(query, params, {
      ...context,
      reason: 'Atualização cadastral de usuário',
    });

    return this.findOne(id);
  }

  /**
   * Anonimização em conformidade com Art. 18 da LGPD
   */
  async anonimizarLgpd(id: string, motivo: string, context?: LgpdContext): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

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
