import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { NetworkNode } from './network-node.entity';

export enum RelationType {
  DEPENDS_ON = 'depends_on',
  CALLS = 'calls',
  PROXIES_TO = 'proxies_to',
}

@Entity('network_edges')
@Index(['projectId'])
@Index(['sourceId'])
@Index(['targetId'])
@Index(['sourceId', 'targetId'])
export class NetworkEdge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column()
  sourceId!: string;

  @ManyToOne(() => NetworkNode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  sourceNode!: NetworkNode;

  @Column()
  targetId!: string;

  @ManyToOne(() => NetworkNode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetId' })
  targetNode!: NetworkNode;

  @Column({
    type: 'enum',
    enum: RelationType,
    default: RelationType.DEPENDS_ON,
  })
  relationType!: RelationType;

  @CreateDateColumn()
  createdAt!: Date;
}
