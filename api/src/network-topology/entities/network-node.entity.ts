import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { MonitoringConfig } from '../../projects/entities/monitoring-config.entity';

export enum NodeType {
  SERVICE = 'service',
  DATABASE = 'database',
  CDN = 'cdn',
  GATEWAY = 'gateway',
  EXTERNAL = 'external',
}

@Entity('network_nodes')
@Index(['projectId'])
@Index(['configId'])
@Index(['projectId', 'configId'])
export class NetworkNode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column({ nullable: true })
  configId?: string;

  @ManyToOne(() => MonitoringConfig, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'configId' })
  monitoringConfig?: MonitoringConfig;

  @Column()
  label!: string;

  @Column({
    type: 'enum',
    enum: NodeType,
    default: NodeType.SERVICE,
  })
  nodeType!: NodeType;

  @Column({ type: 'float', default: 0 })
  x!: number;

  @Column({ type: 'float', default: 0 })
  y!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
