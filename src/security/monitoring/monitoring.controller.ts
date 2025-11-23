import { Controller, Get, Delete, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/dto/user-role.enum';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Dashboard principal com métricas de segurança
   * Requer autenticação JWT + Role ADMIN ou ANALYST
   * Usuários comuns (role: USER) recebem 403 Forbidden
   */
  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  async getDashboard() {
    return this.monitoringService.getSecurityMetrics();
  }

  /**
   * Status geral do sistema de segurança
   * Requer autenticação JWT + Role ADMIN ou ANALYST
   */
  @Get('status')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  async getStatus() {
    return this.monitoringService.getSystemStatus();
  }

  /**
   * Reset de dados para demonstração
   * Limpa todos os eventos de segurança e threat actors
   * Requer autenticação JWT + Role ADMIN
   */
  @Delete('reset')
  @Roles(UserRole.ADMIN)
  async resetDashboard() {
    return this.monitoringService.resetDemoData();
  }
}
