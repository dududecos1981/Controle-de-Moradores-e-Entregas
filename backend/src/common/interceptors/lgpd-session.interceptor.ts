import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class LgpdSessionInterceptor implements NestInterceptor {
  constructor(private readonly databaseService: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const clientIp =
      request.headers['x-forwarded-for'] ||
      request.socket?.remoteAddress ||
      request.ip ||
      '127.0.0.1';

    // Se houver usuário autenticado, injeta metadados no request para os serviços utilizarem nas queries
    if (user) {
      request.lgpdContext = {
        userId: user.id,
        userName: user.nome_completo,
        clientIp: typeof clientIp === 'string' ? clientIp : clientIp[0],
        reason: request.headers['x-audit-reason'] || 'Operação via API Backend',
      };
    }

    return next.handle();
  }
}
