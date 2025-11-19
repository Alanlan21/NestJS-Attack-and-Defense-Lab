import { Module } from '@nestjs/common';
import { HoneypotController } from './honeypot.controller';
import { HoneypotService } from './honeypot.service';
import { DetectionModule } from '../detection/detection.module';
import { ThreatIntelligenceModule } from '../threat-intelligence/threat-intelligence.module';

@Module({
  imports: [DetectionModule, ThreatIntelligenceModule],
  controllers: [HoneypotController],
  providers: [HoneypotService],
})
export class HoneypotModule {}
