import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Environment } from '../enums/environment.enum';
import { NetworkProfile } from '../enums/network-profile.enum';
import { Engine } from '../enums/engine.enum';

@Entity('monitoring_configs')
export class MonitoringConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.monitoringConfigs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @Column({
    type: 'enum',
    enum: Environment,
    default: Environment.PRODUCTION,
  })
  environment!: Environment;

  @Column({ default: 60000 })
  interval!: number;

  @Column({
    type: 'enum',
    enum: NetworkProfile,
    default: NetworkProfile.WIFI,
  })
  networkProfile!: NetworkProfile;

  @Column({
    type: 'enum',
    enum: Engine,
    default: Engine.HTTP,
  })
  engine!: Engine;

  @Column({ default: 30000 })
  timeout!: number;

  @Column({ default: 200 })
  expectedStatus!: number;

  @Column({ default: true })
  checkSsl!: boolean;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ default: false })
  isArchived!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt?: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
