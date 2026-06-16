import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projects/:projectId/latency')
  getLatencyHistory(
    @Param('projectId') projectId: string,
    @Query('range') range?: string,
  ) {
    return this.analyticsService.getLatencyHistory(projectId, range);
  }

  @Get('projects/:projectId/uptime')
  getUptimeStats(
    @Param('projectId') projectId: string,
    @Query('range') range?: string,
  ) {
    return this.analyticsService.getUptimeStats(projectId, range);
  }

  @Get('projects/:projectId/downtime-history')
  getDowntimeHistory(
    @Param('projectId') projectId: string,
    @Query('range') range?: string,
  ) {
    return this.analyticsService.getDowntimeHistory(projectId, range);
  }

  @Get('projects/:projectId/uptime-history')
  getUptimeHistory(
    @Param('projectId') projectId: string,
    @Query('range') range?: string,
  ) {
    return this.analyticsService.getUptimeHistory(projectId, range);
  }

  @Get('projects/:projectId/timing-breakdown')
  getTimingBreakdown(
    @Param('projectId') projectId: string,
    @Query('range') range?: string,
  ) {
    return this.analyticsService.getTimingBreakdown(projectId, range);
  }
}
