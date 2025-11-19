import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SecurityEvent,
  AttackType,
  ThreatLevel,
} from './entities/security-event.entity';
import { AttackPattern } from './entities/attack-pattern.entity';

export interface DetectionResult {
  isAttack: boolean;
  attackType?: AttackType;
  threatLevel?: ThreatLevel;
  shouldBlock: boolean;
  confidence: number;
  matchedPatterns?: string[];
}

@Injectable()
export class DetectionService {
  private readonly logger = new Logger(DetectionService.name);

  constructor(
    @InjectRepository(SecurityEvent)
    private securityEventRepo: Repository<SecurityEvent>,
    @InjectRepository(AttackPattern)
    private attackPatternRepo: Repository<AttackPattern>,
  ) {}

  /**
   * Analisa uma requisição em busca de padrões de ataque
   */
  async analyzeRequest(data: {
    ip: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    body?: any;
    query?: any;
    headers?: any;
  }): Promise<DetectionResult> {
    const detections: DetectionResult[] = [];

    // Detecção de SQL Injection
    const sqlInjection = this.detectSQLInjection(data);
    if (sqlInjection.isAttack) detections.push(sqlInjection);

    // Detecção de XSS
    const xss = this.detectXSS(data);
    if (xss.isAttack) detections.push(xss);

    // Detecção de Path Traversal
    const pathTraversal = this.detectPathTraversal(data);
    if (pathTraversal.isAttack) detections.push(pathTraversal);

    // Se nenhum ataque detectado
    if (detections.length === 0) {
      return {
        isAttack: false,
        shouldBlock: false,
        confidence: 0,
      };
    }

    // Retorna a detecção com maior confiança
    const highestConfidence = detections.reduce((prev, current) =>
      current.confidence > prev.confidence ? current : prev,
    );

    return highestConfidence;
  }

  /**
   * Detecta tentativas de SQL Injection
   */
  private detectSQLInjection(data: any): DetectionResult {
    const sqlPatterns = [
      /(\bunion\b.*\bselect\b)/i,
      /(\bor\b.*=.*)/i,
      /(\'.*\bor\b.*\'.*=.*\')/i,
      /(\bdrop\b.*\btable\b)/i,
      /(;.*\b(drop|delete|insert|update)\b)/i,
      /(\bexec\b.*\()/i,
      /(\/\*.*\*\/)/,
      /(--[^\r\n]*)/,
      /(\bxp_cmdshell\b)/i,
    ];

    const content = JSON.stringify([data.body, data.query]).toLowerCase();
    const matchedPatterns: string[] = [];
    let confidence = 0;

    sqlPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        matchedPatterns.push(pattern.toString());
        confidence += 0.3;
      }
    });

    if (matchedPatterns.length > 0) {
      return {
        isAttack: true,
        attackType: AttackType.SQL_INJECTION,
        threatLevel: confidence > 0.6 ? ThreatLevel.HIGH : ThreatLevel.MEDIUM,
        shouldBlock: true,
        confidence: Math.min(confidence, 1),
        matchedPatterns,
      };
    }

    return { isAttack: false, shouldBlock: false, confidence: 0 };
  }

  /**
   * Detecta tentativas de XSS
   */
  private detectXSS(data: any): DetectionResult {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
    ];

    const content = JSON.stringify([data.body, data.query]);
    const matchedPatterns: string[] = [];
    let confidence = 0;

    xssPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        matchedPatterns.push(pattern.toString());
        confidence += 0.35;
      }
    });

    if (matchedPatterns.length > 0) {
      return {
        isAttack: true,
        attackType: AttackType.XSS,
        threatLevel: confidence > 0.6 ? ThreatLevel.HIGH : ThreatLevel.MEDIUM,
        shouldBlock: true,
        confidence: Math.min(confidence, 1),
        matchedPatterns,
      };
    }

    return { isAttack: false, shouldBlock: false, confidence: 0 };
  }

  /**
   * Detecta Path Traversal
   */
  private detectPathTraversal(data: any): DetectionResult {
    const pathPatterns = [/\.\.[\/\\]/, /%2e%2e[\/\\]/i, /\.\.[%2f%5c]/i];

    const content = JSON.stringify([data.endpoint, data.query, data.body]);
    const matchedPatterns: string[] = [];

    pathPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        matchedPatterns.push(pattern.toString());
      }
    });

    if (matchedPatterns.length > 0) {
      return {
        isAttack: true,
        attackType: AttackType.SUSPICIOUS_PATTERN,
        threatLevel: ThreatLevel.HIGH,
        shouldBlock: true,
        confidence: 0.9,
        matchedPatterns,
      };
    }

    return { isAttack: false, shouldBlock: false, confidence: 0 };
  }

  /**
   * Registra um evento de segurança
   */
  async logSecurityEvent(
    detection: DetectionResult,
    data: {
      ip: string;
      userAgent?: string;
      userId?: string;
      endpoint?: string;
      method?: string;
      payload?: any;
    },
  ): Promise<SecurityEvent> {
    const event = this.securityEventRepo.create({
      attackType: detection.attackType || AttackType.UNKNOWN,
      threatLevel: detection.threatLevel || ThreatLevel.LOW,
      sourceIp: data.ip,
      userAgent: data.userAgent,
      userId: data.userId,
      endpoint: data.endpoint,
      method: data.method,
      payload: data.payload,
      blocked: detection.shouldBlock,
      description: `Detected ${detection.attackType} with ${(detection.confidence * 100).toFixed(0)}% confidence`,
      metadata: {
        confidence: detection.confidence,
        matchedPatterns: detection.matchedPatterns,
      },
    });

    const saved = await this.securityEventRepo.save(event);

    this.logger.warn(
      `Security Event: ${detection.attackType} from ${data.ip} - ${detection.shouldBlock ? 'BLOCKED' : 'LOGGED'}`,
    );

    return saved;
  }

  /**
   * Obtém eventos de segurança recentes
   */
  async getRecentEvents(limit = 100): Promise<SecurityEvent[]> {
    return this.securityEventRepo.find({
      order: { detectedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Analisa tentativas de brute force por IP
   */
  async checkBruteForce(
    ip: string,
    timeWindowMinutes = 5,
    threshold = 5,
  ): Promise<boolean> {
    const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const count = await this.securityEventRepo.count({
      where: {
        sourceIp: ip,
        attackType: AttackType.BRUTE_FORCE,
      },
    });

    return count >= threshold;
  }

  /**
   * Marca um evento como falso positivo
   */
  async markAsFalsePositive(eventId: string): Promise<void> {
    await this.securityEventRepo.update(eventId, { falsePositive: true });
  }
}
