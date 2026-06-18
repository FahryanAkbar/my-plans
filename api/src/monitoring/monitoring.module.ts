import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { WorkerHeartbeatRepository } from './repositories/worker-heartbeat.repository';
import { DependencyHealthService } from './services/dependency-health.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'monitoring-queue',
    }),
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    WorkerHeartbeatRepository,
    DependencyHealthService,
  ],
})
export class MonitoringModule {}
