import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { MonitoringConfig } from './entities/monitoring-config.entity';
import { ProjectRepository } from './repositories/project.repository';
import { MonitoringConfigRepository } from './repositories/monitoring-config.repository';
import { QueueJobRepository } from './repositories/queue-job.repository';
import { QueueSyncService } from './services/queue-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, MonitoringConfig]),
    BullModule.registerQueue({
      name: 'monitoring-queue',
    }),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectRepository,
    MonitoringConfigRepository,
    QueueJobRepository,
    QueueSyncService,
  ],
  exports: [ProjectsService, TypeOrmModule, BullModule],
})
export class ProjectsModule {}
