import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../user/dto/user-role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Espelhamos metadados de rota/classe para permitir que Roles decore níveis distintos
    // (ex.: rota específica sobrepondo requisito do controller). Isso evita acoplamento
    // direto entre guard e endpoints e preserva o padrão declarativo.
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      // Se o JwtStrategy não populou o request, significa que o guard de autenticação
      // anterior foi pulado ou falhou silenciosamente: bloquear aqui evita caminhos
      // anônimos em rotas que supostamente exigem autenticação forte.
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!requiredRoles.includes(user.role)) {
      // Preferimos Forbidden em vez de Unauthorized para não vazar informações
      // sobre existência da rota/usuário e manter consistência com Authorization header.
      throw new ForbiddenException('Usuário não autorizado para esta ação');
    }

    return true;
  }
}
