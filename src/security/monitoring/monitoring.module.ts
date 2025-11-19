import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { DetectionModule } from '../detection/detection.module';
import { ThreatIntelligenceModule } from '../threat-intelligence/threat-intelligence.module';

@Module({
  imports: [DetectionModule, ThreatIntelligenceModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
