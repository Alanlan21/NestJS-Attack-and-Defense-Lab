import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AttackType {
  BRUTE_FORCE = 'brute_force',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  IDOR = 'idor',
  TOKEN_MANIPULATION = 'token_manipulation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  UNKNOWN = 'unknown',
}

@Entity({ name: 'security_events' })
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AttackType })
  attackType: AttackType;

  @Column({ type: 'enum', enum: ThreatLevel })
  threatLevel: ThreatLevel;

  @Column()
  sourceIp: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  blocked: boolean;

  @Column({ default: false })
  falsePositive: boolean;

  @CreateDateColumn()
  detectedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
