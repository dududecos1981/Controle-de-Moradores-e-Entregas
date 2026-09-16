import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  nome_completo: string;
  perfil: 'ADMINISTRADOR' | 'SINDICO' | 'PORTEIRO' | 'MORADOR' | 'PRESTADOR_SERVICO';
  unidade_id?: string;
  status: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    return data ? user?.[data] : user;
  },
);
