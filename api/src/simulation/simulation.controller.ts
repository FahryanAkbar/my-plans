import { Controller, Get, Param, Query } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationRangeQueryDto } from './dto/simulation-range-query.dto';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get('projects/:projectId/latency-comparison')
  getLatencyComparison(
    @Param('projectId') projectId: string,
    @Query() query: SimulationRangeQueryDto,
  ) {
    return this.simulationService.getLatencyComparison(projectId, query.range);
  }

  @Get('projects/:projectId/qos')
  getQosAnalysis(
    @Param('projectId') projectId: string,
    @Query() query: SimulationRangeQueryDto,
  ) {
    return this.simulationService.getQosAnalysis(projectId, query.range);
  }
}
