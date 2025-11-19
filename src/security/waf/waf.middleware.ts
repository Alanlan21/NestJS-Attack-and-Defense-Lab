import {
  Injectable,
  NestMiddleware,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DetectionService } from '../detection/detection.service';
import { ThreatIntelligenceService } from '../threat-intelligence/threat-intelligence.service';

@Injectable()
export class WAFMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WAFMiddleware.name);

  constructor(
    private readonly detectionService: DetectionService,
    private readonly threatIntel: ThreatIntelligenceService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = this.getClientIp(req);
    const wafMode = process.env.WAF_MODE || 'production';

    this.logger.debug(
      `WAF analyzing request from ${ip} to ${req.path} (Mode: ${wafMode})`,
    );

    // Em modo test, IPs de desenvolvimento não são bloqueados
    const DEVELOPMENT_IPS = [
      '127.0.0.1',
      '::1',
      'localhost',
      '::ffff:127.0.0.1',
    ];
    const isDevIP = DEVELOPMENT_IPS.includes(ip);

    // Verifica se o IP está na blocklist (mas ignora se for dev IP em modo test)
    const isBlocked = await this.threatIntel.isIpBlocked(ip);
    if (isBlocked && !(wafMode === 'test' && isDevIP)) {
      this.logger.warn(`❌ Blocked request from blacklisted IP: ${ip}`);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // Analisa a requisição
    const detection = await this.detectionService.analyzeRequest({
      ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers,
    });

    // Se ataque detectado
    if (detection.isAttack) {
      this.logger.warn(
        `🚨 Attack detected: ${detection.attackType} from ${ip} on ${req.path} (confidence: ${(detection.confidence * 100).toFixed(0)}%)`,
      );

      // Registra o evento
      await this.detectionService.logSecurityEvent(detection, {
        ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.path,
        method: req.method,
        payload: { body: req.body, query: req.query },
      });

      // Adiciona à threat intelligence
      await this.threatIntel.recordThreatActivity(
        ip,
        detection.attackType,
        detection.threatLevel,
      );

      // Bloqueia se necessário
      if (detection.shouldBlock) {
        if (wafMode === 'test' && isDevIP) {
          // Modo teste com IP dev: apenas loga, não bloqueia
          this.logger.warn(
            `⚠️  [TEST MODE] Would block ${detection.attackType} attack from ${ip} on ${req.path} (confidence: ${(detection.confidence * 100).toFixed(0)}%)`,
          );
        } else if (wafMode === 'test') {
          // Modo teste com IP externo: bloqueia normalmente
          this.logger.warn(
            `❌ [TEST MODE] Blocking ${detection.attackType} attack from ${ip} on ${req.path}`,
          );
          throw new HttpException(
            {
              statusCode: HttpStatus.FORBIDDEN,
              message: 'Request blocked by WAF',
              reason: 'Suspicious activity detected',
            },
            HttpStatus.FORBIDDEN,
          );
        } else {
          // Modo produção: bloqueia todos
          this.logger.warn(
            `❌ [PRODUCTION] Blocking ${detection.attackType} attack from ${ip} on ${req.path}`,
          );
          throw new HttpException(
            {
              statusCode: HttpStatus.FORBIDDEN,
              message: 'Request blocked by WAF',
              reason: 'Suspicious activity detected',
            },
            HttpStatus.FORBIDDEN,
          );
        }
      }
    } else {
      this.logger.debug(`✅ Clean request from ${ip} to ${req.path}`);
    }

    next();
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
