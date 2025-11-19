import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/dto/user-role.enum';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Dashboard principal com métricas de segurança
   * Público para fins de demonstração (dashboard frontend)
   * Em produção, deve exigir autenticação
   */
  @Get('dashboard')
  async getDashboard() {
    return this.monitoringService.getSecurityMetrics();
  }

  /**
   * Status geral do sistema de segurança
   * Público para fins de demonstração
   */
  @Get('status')
  async getStatus() {
    return this.monitoringService.getSystemStatus();
  }
}
