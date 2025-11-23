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
    // Última 1 hora em intervalos de 5 minutos (12 pontos bem distribuídos)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = events.filter((e) => e.detectedAt >= lastHour);

    // Inicializa intervalos de 5 minutos
    const intervalCount: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const intervalDate = new Date(now.getTime() - i * 5 * 60 * 1000);
      const hours = intervalDate.getHours().toString().padStart(2, '0');
      const minutes = Math.floor(intervalDate.getMinutes() / 5) * 5;
      const intervalKey = `${hours}:${minutes.toString().padStart(2, '0')}`;
      intervalCount[intervalKey] = 0;
    }

    // Conta eventos por intervalo
    recentEvents.forEach((event) => {
      const eventDate = new Date(event.detectedAt);
      const hours = eventDate.getHours().toString().padStart(2, '0');
      const minutes = Math.floor(eventDate.getMinutes() / 5) * 5;
      const intervalKey = `${hours}:${minutes.toString().padStart(2, '0')}`;

      if (intervalCount[intervalKey] !== undefined) {
        intervalCount[intervalKey]++;
      }
    });

    return Object.entries(intervalCount)
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

  /**
   * Reset de dados para demonstração
   * Limpa todos os eventos de segurança e threat actors
   */
  async resetDemoData(): Promise<{ message: string; cleared: any }> {
    const eventsCleared = await this.detectionService.clearAllEvents();
    const threatsCleared = await this.threatIntel.clearAllThreats();
    const blocklistCleared = await this.threatIntel.clearBlocklist();

    return {
      message: 'Dashboard reset realizado com sucesso',
      cleared: {
        securityEvents: eventsCleared,
        threatActors: threatsCleared,
        blocklist: blocklistCleared,
      },
    };
  }
}
