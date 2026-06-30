import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { BatchProcessor } from './processors/batch.processor';
import { BatchInfluxRepository } from './repositories/batch-influx.repository';
import { DailySummaryRepository } from './repositories/daily-summary.repository';
import { DailySummary } from './entities/summary.entity';
import { Project } from '../projects/entities/project.entity';
import { MonitoringConfig } from '../projects/entities/monitoring-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailySummary, Project, MonitoringConfig]),
    BullModule.registerQueue({ name: 'batch-queue' }),
  ],
  controllers: [BatchController],
  providers: [
    BatchService,
    BatchProcessor,
    BatchInfluxRepository,
    DailySummaryRepository,
  ],
})
export class BatchModule {}
