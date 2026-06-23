import { Injectable } from '@nestjs/common';
import { HealthStatus } from './entities/health-status.entity';
import { WorkerStatus } from './entities/worker-status.entity';
import { WorkerHeartbeatRepository } from './repositories/worker-heartbeat.repository';
import { DependencyHealthService } from './services/dependency-health.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly workerHeartbeatRepository: WorkerHeartbeatRepository,
    private readonly dependencyHealthService: DependencyHealthService,
  ) {}

  getWorkersStatus(): Promise<WorkerStatus[]> {
    return this.workerHeartbeatRepository.getActiveWorkers();
  }

  getHealthStatus(): Promise<HealthStatus> {
    return this.dependencyHealthService.getHealthStatus();
  }
}
