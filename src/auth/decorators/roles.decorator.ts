import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../../user/dto/user-role.enum';

export const ROLES_KEY = 'roles';
// Decorator fino: delega a lógica ao guard e mantém controllers declarativos.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
