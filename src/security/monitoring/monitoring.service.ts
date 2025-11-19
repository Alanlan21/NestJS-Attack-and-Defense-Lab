import { Injectable } from '@nestjs/common';
import { DetectionService } from '../detection/detection.service';
import { ThreatIntelligenceService } from '../threat-intelligence/threat-intelligence.service';
import {
  AttackType,
  ThreatLevel,
} from '../detection/entities/security-event.entity';

export interface SecurityMetrics {
  totalEvents: number;
  blockedEvents: number;
  attacksByType: Record<string, number>;
  threatsByLevel: Record<string, number>;
  topThreats: Array<{
    ip: string;
    score: number;
    attackCount: number;
    riskLevel: string;
  }>;
  recentEvents: Array<any>;
  timeline: Array<{
    hour: string;
    count: number;
  }>;
}

@Injectable()
export class MonitoringService {
  constructor(
    private readonly detectionService: DetectionService,
    private readonly threatIntel: ThreatIntelligenceService,
  ) {}

  /**
   * Obtém dashboard com métricas de segurança
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const events = await this.detectionService.getRecentEvents(500);
    const topThreats = await this.threatIntel.getTopThreats(10);

    // Agrupa eventos por tipo
    const attacksByType: Record<string, number> = {};
    const threatsByLevel: Record<string, number> = {};

    events.forEach((event) => {
      attacksByType[event.attackType] =
        (attacksByType[event.attackType] || 0) + 1;
      threatsByLevel[event.threatLevel] =
        (threatsByLevel[event.threatLevel] || 0) + 1;
    });

    // Timeline (últimas 24 horas)
    const timeline = this.generateTimeline(events);

    return {
      totalEvents: events.length,
      blockedEvents: events.filter((e) => e.blocked).length,
      attacksByType,
      threatsByLevel,
      topThreats: topThreats.map((t) => ({
        ip: t.ipAddress,
        score: t.threatScore,
        attackCount: t.attackCount,
        riskLevel: t.riskLevel,
      })),
      recentEvents: events.slice(0, 20).map((e) => ({
        id: e.id,
        attackType: e.attackType,
        severity: e.threatLevel,
        sourceIp: e.sourceIp,
        path: e.endpoint,
        method: e.method || 'POST',
        blocked: e.blocked,
        timestamp: e.detectedAt,
      })),
      timeline,
    };
  }

  /**
   * Gera timeline de eventos por hora
   */
  private generateTimeline(
    events: any[],
  ): Array<{ hour: string; count: number }> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter((e) => e.detectedAt >= last24Hours);

    const hourlyCount: Record<string, number> = {};

    recentEvents.forEach((event) => {
      const hour =
        new Date(event.detectedAt).toISOString().slice(0, 13) + ':00';
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });

    return Object.entries(hourlyCount)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  /**
   * Obtém status do sistema
   */
  async getSystemStatus(): Promise<any> {
    const blocklist = await this.threatIntel.getBlocklist();
    const topThreats = await this.threatIntel.getTopThreats(5);

    return {
      status: 'operational',
      blockedIps: blocklist.length,
      activeThreats: topThreats.filter(
        (t) =>
          t.riskLevel === ThreatLevel.HIGH ||
          t.riskLevel === ThreatLevel.CRITICAL,
      ).length,
      timestamp: new Date().toISOString(),
    };
  }
}
