import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DetectionService } from '../security/detection/detection.service';
import { ThreatIntelligenceService } from '../security/threat-intelligence/threat-intelligence.service';
import {
  AttackType,
  ThreatLevel,
} from '../security/detection/entities/security-event.entity';

@Controller('auth')
export class AuthController {
  // Cache em memória para contar tentativas (em produção, usar Redis)
  private loginAttempts: Map<string, { count: number; firstAttempt: Date }> =
    new Map();

  constructor(
    private readonly authService: AuthService,
    @Inject(DetectionService)
    private readonly detectionService: DetectionService,
    @Inject(ThreatIntelligenceService)
    private readonly threatIntel: ThreatIntelligenceService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'];

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      // Registra tentativa falha de login
      this.trackFailedLogin(ip, loginDto.email, userAgent);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Login bem-sucedido - limpa contador
    this.loginAttempts.delete(ip);

    return this.authService.login(user);
  }

  private trackFailedLogin(ip: string, email: string, userAgent: string) {
    // Obtém ou cria contador de tentativas
    const attempts = this.loginAttempts.get(ip) || {
      count: 0,
      firstAttempt: new Date(),
    };
    attempts.count++;

    const now = new Date();
    const timeDiff = now.getTime() - attempts.firstAttempt.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Se passou mais de 5 minutos, reseta o contador
    if (minutesDiff > 5) {
      attempts.count = 1;
      attempts.firstAttempt = now;
    }

    this.loginAttempts.set(ip, attempts);

    // Se teve 3+ tentativas em 5 minutos, registra como brute force
    if (attempts.count >= 3) {
      // Registra o evento de segurança
      this.detectionService.logSecurityEvent(
        {
          isAttack: true,
          attackType: AttackType.BRUTE_FORCE,
          threatLevel: ThreatLevel.HIGH,
          shouldBlock: true,
          confidence: 1.0,
          matchedPatterns: [
            `${attempts.count} failed login attempts in 5 minutes`,
          ],
        },
        {
          ip,
          userAgent,
          endpoint: '/auth/login',
          method: 'POST',
          payload: { email, attempts: attempts.count },
        },
      );

      // Registra como threat actor
      this.threatIntel.recordThreatActivity(
        ip,
        AttackType.BRUTE_FORCE,
        ThreatLevel.HIGH,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }
}
