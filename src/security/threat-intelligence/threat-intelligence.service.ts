import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ThreatActor } from './entities/threat-actor.entity';
import { IpBlocklist } from './entities/ip-blocklist.entity';
import {
  AttackType,
  ThreatLevel,
} from '../detection/entities/security-event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ThreatIntelligenceService {
  private readonly logger = new Logger(ThreatIntelligenceService.name);

  // Thresholds para threat scoring
  private readonly THREAT_SCORE_THRESHOLDS = {
    LOW: 20,
    MEDIUM: 50,
    HIGH: 80,
    CRITICAL: 100,
  };

  private readonly ATTACK_TYPE_SCORES = {
    [AttackType.BRUTE_FORCE]: 10,
    [AttackType.SQL_INJECTION]: 25,
    [AttackType.XSS]: 20,
    [AttackType.TOKEN_MANIPULATION]: 30,
    [AttackType.IDOR]: 15,
    [AttackType.RATE_LIMIT_EXCEEDED]: 5,
    [AttackType.SUSPICIOUS_PATTERN]: 10,
    [AttackType.UNKNOWN]: 5,
  };

  constructor(
    @InjectRepository(ThreatActor)
    private threatActorRepo: Repository<ThreatActor>,
    @InjectRepository(IpBlocklist)
    private blocklistRepo: Repository<IpBlocklist>,
  ) {}

  /**
   * Registra atividade maliciosa de um IP
   */
  async recordThreatActivity(
    ip: string,
    attackType: AttackType,
    threatLevel: ThreatLevel,
  ): Promise<ThreatActor> {
    let actor = await this.threatActorRepo.findOne({
      where: { ipAddress: ip },
    });

    if (!actor) {
      actor = this.threatActorRepo.create({
        ipAddress: ip,
        threatScore: 0,
        attackCount: 0,
        attackTypes: [],
        firstSeen: new Date(),
        metadata: {},
      });
    }

    // Incrementa contadores
    actor.attackCount += 1;
    actor.lastActivity = new Date();

    // Adiciona tipo de ataque se novo
    if (!actor.attackTypes.includes(attackType)) {
      actor.attackTypes.push(attackType);
    }

    // Calcula novo threat score
    const scoreIncrement = this.ATTACK_TYPE_SCORES[attackType] || 5;
    actor.threatScore += scoreIncrement;

    // Determina risk level baseado no score
    actor.riskLevel = this.calculateRiskLevel(actor.threatScore);

    // Auto-block se crítico
    if (
      actor.threatScore >= this.THREAT_SCORE_THRESHOLDS.CRITICAL &&
      !actor.isBlocked
    ) {
      await this.blockIp(
        ip,
        `Auto-blocked: Critical threat score (${actor.threatScore})`,
      );
      actor.isBlocked = true;
    }

    await this.threatActorRepo.save(actor);

    this.logger.warn(
      `Threat activity recorded: ${ip} - ${attackType} (Score: ${actor.threatScore}, Level: ${actor.riskLevel})`,
    );

    return actor;
  }

  /**
   * Calcula o nível de risco baseado no score
   */
  private calculateRiskLevel(score: number): ThreatLevel {
    if (score >= this.THREAT_SCORE_THRESHOLDS.CRITICAL)
      return ThreatLevel.CRITICAL;
    if (score >= this.THREAT_SCORE_THRESHOLDS.HIGH) return ThreatLevel.HIGH;
    if (score >= this.THREAT_SCORE_THRESHOLDS.MEDIUM) return ThreatLevel.MEDIUM;
    return ThreatLevel.LOW;
  }

  /**
   * Bloqueia um IP
   */
  async blockIp(
    ip: string,
    reason: string,
    expiresInHours?: number,
  ): Promise<IpBlocklist> {
    const existing = await this.blocklistRepo.findOne({
      where: { ipAddress: ip },
    });

    if (existing) {
      existing.active = true;
      existing.reason = reason;
      if (expiresInHours) {
        existing.expiresAt = new Date(
          Date.now() + expiresInHours * 60 * 60 * 1000,
        );
      }
      return this.blocklistRepo.save(existing);
    }

    const blocked = this.blocklistRepo.create({
      ipAddress: ip,
      reason,
      expiresAt: expiresInHours
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
        : null,
    });

    this.logger.warn(`IP blocked: ${ip} - ${reason}`);
    return this.blocklistRepo.save(blocked);
  }

  /**
   * Remove IP da blocklist
   */
  async unblockIp(ip: string): Promise<void> {
    await this.blocklistRepo.update({ ipAddress: ip }, { active: false });
    await this.threatActorRepo.update({ ipAddress: ip }, { isBlocked: false });
    this.logger.log(`IP unblocked: ${ip}`);
  }

  /**
   * Verifica se um IP está bloqueado
   */
  async isIpBlocked(ip: string): Promise<boolean> {
    const blocked = await this.blocklistRepo.findOne({
      where: { ipAddress: ip, active: true },
    });

    if (!blocked) return false;

    // Verifica se expirou
    if (blocked.expiresAt && blocked.expiresAt < new Date()) {
      await this.unblockIp(ip);
      return false;
    }

    return true;
  }

  /**
   * Obtém informações de um threat actor
   */
  async getThreatActor(ip: string): Promise<ThreatActor | null> {
    return this.threatActorRepo.findOne({ where: { ipAddress: ip } });
  }

  /**
   * Lista top threat actors
   */
  async getTopThreats(limit = 50): Promise<ThreatActor[]> {
    return this.threatActorRepo.find({
      order: { threatScore: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtém todas as entradas da blocklist
   */
  async getBlocklist(): Promise<IpBlocklist[]> {
    return this.blocklistRepo.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cron job para limpar blocklist expirada
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredBlocks(): Promise<void> {
    const expired = await this.blocklistRepo.find({
      where: {
        active: true,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const entry of expired) {
      await this.unblockIp(entry.ipAddress);
    }

    if (expired.length > 0) {
      this.logger.log(`Cleaned up ${expired.length} expired IP blocks`);
    }
  }

  /**
   * Decai threat scores ao longo do tempo
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async decayThreatScores(): Promise<void> {
    const actors = await this.threatActorRepo.find();

    for (const actor of actors) {
      // Reduz 10% do score a cada dia
      actor.threatScore = Math.floor(actor.threatScore * 0.9);
      actor.riskLevel = this.calculateRiskLevel(actor.threatScore);

      // Se score muito baixo, remove do DB
      if (actor.threatScore < 5) {
        await this.threatActorRepo.remove(actor);
      } else {
        await this.threatActorRepo.save(actor);
      }
    }

    this.logger.log(`Decayed threat scores for ${actors.length} actors`);
  }
}
