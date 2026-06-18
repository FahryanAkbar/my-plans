import { Controller, Get } from '@nestjs/common';
import { HealthStatus } from './entities/health-status.entity';
import { WorkerStatus } from './entities/worker-status.entity';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('workers')
  getWorkers(): Promise<WorkerStatus[]> {
    return this.monitoringService.getWorkersStatus();
  }

  @Get('health')
  getHealth(): Promise<HealthStatus> {
    return this.monitoringService.getHealthStatus();
  }
}
