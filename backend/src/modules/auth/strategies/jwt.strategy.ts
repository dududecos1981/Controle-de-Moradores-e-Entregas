import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../database/database.service';

export interface JwtPayload {
  sub: string;
  email: string;
  perfil: string;
  unidade_id?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', 'jwt-default-secret-change-in-prod'),
    });
  }

  async validate(payload: JwtPayload) {
    const query = `
      SELECT id, nome_completo, cpf, email, perfil, status, unidade_id, lgpd_anonimizado
      FROM usuarios
      WHERE id = $1 AND status = 'ATIVO' AND lgpd_anonimizado = FALSE
    `;
    const result = await this.databaseService.query(query, [payload.sub]);

    if (result.rowCount === 0) {
      throw new UnauthorizedException('Sessão inválida: Usuário não existe ou encontra-se inativo/bloqueado.');
    }

    return result.rows[0];
  }
}
