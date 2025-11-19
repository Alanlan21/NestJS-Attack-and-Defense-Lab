import { Module } from '@nestjs/common';
import { DetectionModule } from './detection/detection.module';
import { ThreatIntelligenceModule } from './threat-intelligence/threat-intelligence.module';
import { HoneypotModule } from './honeypot/honeypot.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    DetectionModule,
    ThreatIntelligenceModule,
    HoneypotModule,
    MonitoringModule,
  ],
  exports: [DetectionModule, ThreatIntelligenceModule],
})
export class SecurityModule {}
