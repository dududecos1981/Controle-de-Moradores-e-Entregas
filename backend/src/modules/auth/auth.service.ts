import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/refresh-token.dto';
import { JwtPayload } from './strategies/jwt.strategy';

import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Autenticação via Email e Senha
   */
  async login(dto: LoginDto, ipAddress?: string): Promise<AuthResponseDto> {
    const rawInput = (dto.email || '').trim();
    const cleanDigits = rawInput.replace(/\D/g, '');

    const userQuery = `
      SELECT u.id, u.nome_completo, u.cpf, u.email, u.senha_hash, u.perfil, u.status, u.unidade_id, u.lgpd_anonimizado,
             un.bloco as unidade_bloco, un.numero as unidade_numero
      FROM usuarios u
      LEFT JOIN unidades un ON un.id = u.unidade_id
      WHERE LOWER(TRIM(u.email)) = LOWER($1)
         OR u.cpf = $1
         OR ($2 <> '' AND regexp_replace(u.cpf, '[^0-9]', '', 'g') = $2)
      LIMIT 1
    `;
    const result = await this.databaseService.query(userQuery, [rawInput, cleanDigits]);

    if (result.rowCount === 0) {
      throw new UnauthorizedException('Credenciais de acesso incorretas.');
    }

    const user = result.rows[0];

    if (user.status !== 'ATIVO' || user.lgpd_anonimizado) {
      throw new UnauthorizedException('Conta de usuário inativa, bloqueada ou anonimizada.');
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, user.senha_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais de acesso incorretas.');
    }

    return this.generateTokens(user);
  }

  /**
   * Registro de novo usuário com hash de senha e validação de duplicidade
   */
  async register(dto: RegisterDto, ipAddress?: string): Promise<AuthResponseDto> {
    // Verifica duplicação de CPF ou Email
    const checkQuery = `
      SELECT id, cpf, email FROM usuarios WHERE cpf = $1 OR email = $2
    `;
    const checkResult = await this.databaseService.query(checkQuery, [dto.cpf, dto.email]);
    if (checkResult.rowCount > 0) {
      const existing = checkResult.rows[0];
      if (existing.cpf === dto.cpf) {
        throw new ConflictException('Já existe um usuário cadastrado com este CPF.');
      }
      if (existing.email === dto.email) {
        throw new ConflictException('Já existe um usuário cadastrado com este E-mail.');
      }
    }

    let finalUnidadeId = dto.unidade_id || null;

    // Se informou unidade_id, valida existência
    if (finalUnidadeId) {
      const checkUnidade = await this.databaseService.query(
        `SELECT id FROM unidades WHERE id = $1 AND status = 'ATIVO'`,
        [finalUnidadeId],
      );
      if (checkUnidade.rowCount === 0) {
        throw new BadRequestException('A unidade informada não existe ou está inativa.');
      }
    } else if (dto.unidade_bloco && dto.unidade_numero) {
      const checkUnidade = await this.databaseService.query(
        `SELECT id FROM unidades WHERE bloco = $1 AND numero = $2 LIMIT 1`,
        [dto.unidade_bloco.trim(), dto.unidade_numero.trim()],
      );
      if (checkUnidade.rowCount > 0) {
        finalUnidadeId = checkUnidade.rows[0].id;
      } else {
        const createUnidade = await this.databaseService.query(
          `INSERT INTO unidades (bloco, numero, tipo, status) VALUES ($1, $2, 'APARTAMENTO', 'ATIVO') RETURNING id`,
          [dto.unidade_bloco.trim(), dto.unidade_numero.trim()],
        );
        finalUnidadeId = createUnidade.rows[0].id;
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
        unidade_id,
        status,
        lgpd_termo_aceito,
        lgpd_data_aceite,
        lgpd_ip_aceite
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ATIVO', TRUE, clock_timestamp(), $8)
      RETURNING id, nome_completo, cpf, email, perfil, status, unidade_id
    `;

    const insertResult = await this.databaseService.queryWithLgpdContext(
      insertQuery,
      [
        dto.nome_completo,
        dto.cpf,
        dto.email,
        senhaHash,
        dto.telefone || null,
        dto.perfil || 'MORADOR',
        finalUnidadeId,
        ipAddress || '127.0.0.1',
      ],
      {
        userName: dto.nome_completo,
        clientIp: ipAddress,
        reason: 'Auto-cadastro/Registro de usuário',
      },
    );

    const newUser = {
      ...insertResult.rows[0],
      unidade_bloco: dto.unidade_bloco || null,
      unidade_numero: dto.unidade_numero || null,
    };
    this.logger.log(`Novo usuário registrado com sucesso: ${newUser.email} (${newUser.perfil})`);

    return this.generateTokens(newUser);
  }

  /**
   * Redefinição de senha com validação de CPF e E-mail
   */
  async redefinirSenha(dto: ResetPasswordDto, ipAddress?: string): Promise<{ success: boolean; message: string }> {
    const rawEmail = (dto.email || '').trim();
    const rawCpf = (dto.cpf || '').trim();
    const cleanDigits = rawCpf.replace(/\D/g, '');

    const userQuery = `
      SELECT id, nome_completo, cpf, email, status
      FROM usuarios
      WHERE LOWER(TRIM(email)) = LOWER($1)
        AND (cpf = $2 OR ($3 <> '' AND regexp_replace(cpf, '[^0-9]', '', 'g') = $3))
      LIMIT 1
    `;
    const result = await this.databaseService.query(userQuery, [rawEmail, rawCpf, cleanDigits]);

    if (result.rowCount === 0) {
      throw new BadRequestException('Nenhum usuário localizado com o e-mail e CPF informados.');
    }

    const user = result.rows[0];
    const saltRounds = this.configService.get<number>('jwt.bcryptSaltRounds', 10);
    const senhaHash = await bcrypt.hash(dto.nova_senha, saltRounds);

    await this.databaseService.queryWithLgpdContext(
      `UPDATE usuarios SET senha_hash = $1, updated_at = clock_timestamp() WHERE id = $2`,
      [senhaHash, user.id],
      {
        userId: user.id,
        userName: user.nome_completo,
        clientIp: ipAddress,
        reason: 'Redefinição de senha do usuário',
      },
    );

    this.logger.log(`Senha redefinida com sucesso para o usuário: ${user.email}`);
    return { success: true, message: 'Senha redefinida com sucesso.' };
  }

  /**
   * Renovação de tokens via Refresh Token
   */
  async refreshToken(user: any): Promise<AuthResponseDto> {
    return this.generateTokens(user);
  }

  /**
   * Gera o par Access Token e Refresh Token JWT
   */
  private generateTokens(user: any): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      perfil: user.perfil,
      unidade_id: user.unidade_id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 min em segundos
      user: {
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email,
        cpf: user.cpf,
        perfil: user.perfil,
        unidade_id: user.unidade_id || null,
        unidade_bloco: user.unidade_bloco || null,
        unidade_numero: user.unidade_numero || null,
        status: user.status,
      },
    };
  }
}
