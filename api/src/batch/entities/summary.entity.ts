import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { MonitoringConfig } from '../../projects/entities/monitoring-config.entity';

@Entity('daily_monitoring_summary')
@Unique(['projectId', 'configId', 'date'])
export class DailySummary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Index()
  @Column('uuid')
  configId!: string;

  @ManyToOne(() => MonitoringConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'configId' })
  config!: MonitoringConfig;

  @Column()
  url!: string;

  @Index()
  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'float', default: 0 })
  avgLatencyMs!: number;

  @Column({ type: 'float', default: 0 })
  maxLatencyMs!: number;

  @Column({ type: 'float', default: 0 })
  minLatencyMs!: number;

  @Column({ type: 'float', default: 0 })
  uptimePercent!: number;

  @Column({ type: 'int', default: 0 })
  totalChecks!: number;

  @Column({ type: 'int', default: 0 })
  failedChecks!: number;

  @Column({ type: 'int', default: 0 })
  downtimeIncidents!: number;

  @Column({ type: 'int', default: 0 })
  totalDowntimeSeconds!: number;

  @CreateDateColumn()
  processedAt!: Date;
}
