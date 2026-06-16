import { Controller, Get, Param, Query } from '@nestjs/common';
import { SimulationService } from './simulation.service';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get('projects/:projectId/latency-comparison')
  getLatencyComparison(
    @Param('projectId') projectId: string,
    @Query('range') range?: string,
  ) {
    return this.simulationService.getLatencyComparison(projectId, range);
  }
}
