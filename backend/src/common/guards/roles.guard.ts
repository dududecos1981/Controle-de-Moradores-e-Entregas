import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();

    if (!user || !user.perfil) {
      throw new ForbiddenException('Acesso negado: Perfil de usuário não identificado.');
    }

    const hasRole = requiredRoles.includes(user.perfil);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado: Perfil '${user.perfil}' não possui permissão para este recurso. Perfis autorizados: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
