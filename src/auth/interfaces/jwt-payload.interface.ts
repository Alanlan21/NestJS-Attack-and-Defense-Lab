import { UserRole } from '../../user/dto/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  // Claims padrões do JWT são opcionais; mantemos para inspecionar expiração sem reprocessar token.
  iat?: number;
  exp?: number;
}
