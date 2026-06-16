import { Controller, Get } from '@nestjs/common';
import {
  MonitoringService,
  WorkerStatus,
  HealthStatus,
} from './monitoring.service';

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
