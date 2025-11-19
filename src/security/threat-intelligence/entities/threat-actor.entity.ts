import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AttackType,
  ThreatLevel,
} from '../../detection/entities/security-event.entity';

@Entity({ name: 'threat_actors' })
export class ThreatActor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ipAddress: string;

  @Column({ type: 'int', default: 0 })
  threatScore: number;

  @Column({ type: 'enum', enum: ThreatLevel, default: ThreatLevel.LOW })
  riskLevel: ThreatLevel;

  @Column({ type: 'int', default: 0 })
  attackCount: number;

  @Column({ type: 'simple-array', nullable: true })
  attackTypes: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastActivity: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstSeen: Date;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    userAgents?: string[];
    countries?: string[];
    targetedEndpoints?: string[];
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
