import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttackType } from './security-event.entity';

@Entity({ name: 'attack_patterns' })
export class AttackPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AttackType })
  attackType: AttackType;

  @Column({ type: 'text' })
  pattern: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'int', default: 0 })
  matchCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
