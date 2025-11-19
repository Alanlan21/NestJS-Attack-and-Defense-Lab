import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreatIntelligenceService } from './threat-intelligence.service';
import { ThreatActor } from './entities/threat-actor.entity';
import { IpBlocklist } from './entities/ip-blocklist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ThreatActor, IpBlocklist])],
  providers: [ThreatIntelligenceService],
  exports: [ThreatIntelligenceService],
})
export class ThreatIntelligenceModule {}
