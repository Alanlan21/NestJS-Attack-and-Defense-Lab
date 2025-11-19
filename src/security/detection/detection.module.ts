import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectionService } from './detection.service';
import { SecurityEvent } from './entities/security-event.entity';
import { AttackPattern } from './entities/attack-pattern.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent, AttackPattern])],
  providers: [DetectionService],
  exports: [DetectionService],
})
export class DetectionModule {}
