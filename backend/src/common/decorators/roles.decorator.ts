import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type UserRole = 'ADMINISTRADOR' | 'SINDICO' | 'PORTEIRO' | 'MORADOR' | 'PRESTADOR_SERVICO';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
