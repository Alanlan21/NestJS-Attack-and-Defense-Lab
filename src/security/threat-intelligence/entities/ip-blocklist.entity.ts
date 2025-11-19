import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'ip_blocklist' })
export class IpBlocklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  blockedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
