import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MonitoringConfig } from './monitoring-config.entity';

@Entity('projects')
export class Project {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @OneToMany(() => MonitoringConfig, (config) => config.project, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  monitoringConfigs!: MonitoringConfig[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
