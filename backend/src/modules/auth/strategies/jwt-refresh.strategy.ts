import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DatabaseService } from '../../../database/database.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.body?.refreshToken || request?.headers?.['x-refresh-token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret', 'jwt-refresh-default-secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const query = `
      SELECT id, nome_completo, cpf, email, perfil, status, unidade_id, lgpd_anonimizado
      FROM usuarios
      WHERE id = $1 AND status = 'ATIVO' AND lgpd_anonimizado = FALSE
    `;
    const result = await this.databaseService.query(query, [payload.sub]);

    if (result.rowCount === 0) {
      throw new UnauthorizedException('Refresh token inválido: Usuário não existe ou está inativo.');
    }

    return result.rows[0];
  }
}
