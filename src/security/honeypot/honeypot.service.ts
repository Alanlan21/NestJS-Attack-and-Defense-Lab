import { Injectable, Logger } from '@nestjs/common';
import { DetectionService } from '../detection/detection.service';
import { ThreatIntelligenceService } from '../threat-intelligence/threat-intelligence.service';
import {
  AttackType,
  ThreatLevel,
} from '../detection/entities/security-event.entity';

@Injectable()
export class HoneypotService {
  private readonly logger = new Logger(HoneypotService.name);

  constructor(
    private readonly detectionService: DetectionService,
    private readonly threatIntel: ThreatIntelligenceService,
  ) {}

  /**
   * Registra acesso a endpoint honeypot
   */
  async recordHoneypotAccess(data: {
    ip: string;
    endpoint: string;
    method: string;
    userAgent?: string;
    payload?: any;
  }): Promise<void> {
    this.logger.warn(
      `🍯 Honeypot triggered: ${data.method} ${data.endpoint} from ${data.ip}`,
    );

    // Registra como evento de segurança
    await this.detectionService.logSecurityEvent(
      {
        isAttack: true,
        attackType: AttackType.SUSPICIOUS_PATTERN,
        threatLevel: ThreatLevel.MEDIUM,
        shouldBlock: false,
        confidence: 0.8,
        matchedPatterns: ['honeypot-access'],
      },
      data,
    );

    // Adiciona à threat intelligence
    await this.threatIntel.recordThreatActivity(
      data.ip,
      AttackType.SUSPICIOUS_PATTERN,
      ThreatLevel.MEDIUM,
    );
  }

  /**
   * Gera respostas realistas mas falsas para enganar atacantes
   */
  generateFakeResponse(type: 'admin' | 'database' | 'api' | 'file'): any {
    switch (type) {
      case 'admin':
        return {
          success: true,
          message: 'Admin access granted',
          token: this.generateFakeToken(),
          user: {
            id: 1,
            username: 'admin',
            role: 'administrator',
            permissions: ['*'],
          },
        };

      case 'database':
        return {
          success: true,
          data: [
            {
              id: 1,
              username: 'john_doe',
              email: 'john@example.com',
              hash: '5f4dcc3b5aa765d61d8327deb882cf99',
            },
            {
              id: 2,
              username: 'jane_doe',
              email: 'jane@example.com',
              hash: '098f6bcd4621d373cade4e832627b4f6',
            },
          ],
        };

      case 'api':
        return {
          version: '2.1.0',
          endpoints: ['/api/users', '/api/admin', '/api/secret'],
          documentation: '/api/docs',
        };

      case 'file':
        return {
          files: [
            'config.json',
            'database.sql',
            'passwords.txt',
            'private_keys.pem',
          ],
          message: 'Directory listing successful',
        };

      default:
        return { success: false, message: 'Invalid request' };
    }
  }

  /**
   * Gera um token JWT falso mas convincente
   */
  private generateFakeToken(): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64');
    const payload = Buffer.from(
      JSON.stringify({
        sub: '1',
        username: 'admin',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString('base64');
    const signature = 'FAKE_' + Math.random().toString(36).substring(2, 15);

    return `${header}.${payload}.${signature}`;
  }
}
