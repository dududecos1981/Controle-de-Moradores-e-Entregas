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
    const userQuery = `
      SELECT id, nome_completo, cpf, email, senha_hash, perfil, status, unidade_id, lgpd_anonimizado
      FROM usuarios
      WHERE email = $1
    `;
    const result = await this.databaseService.query(userQuery, [dto.email]);

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

    // Se informou unidade_id, valida existência
    if (dto.unidade_id) {
      const checkUnidade = await this.databaseService.query(
        `SELECT id FROM unidades WHERE id = $1 AND status = 'ATIVO'`,
        [dto.unidade_id],
      );
      if (checkUnidade.rowCount === 0) {
        throw new BadRequestException('A unidade informada não existe ou está inativa.');
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
        dto.unidade_id || null,
        ipAddress || '127.0.0.1',
      ],
      {
        userName: dto.nome_completo,
        clientIp: ipAddress,
        reason: 'Auto-cadastro/Registro de usuário',
      },
    );

    const newUser = insertResult.rows[0];
    this.logger.log(`Novo usuário registrado com sucesso: ${newUser.email} (${newUser.perfil})`);

    return this.generateTokens(newUser);
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
        status: user.status,
      },
    };
  }
}
