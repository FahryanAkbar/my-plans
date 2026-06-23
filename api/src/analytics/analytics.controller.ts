import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRangeQueryDto } from './dto/analytics-range-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projects/:projectId/latency')
  getLatencyHistory(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analyticsService.getLatencyHistory(projectId, query.range);
  }

  @Get('projects/:projectId/uptime')
  getUptimeStats(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analyticsService.getUptimeStats(projectId, query.range);
  }

  @Get('projects/:projectId/downtime-history')
  getDowntimeHistory(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analyticsService.getDowntimeHistory(projectId, query.range);
  }

  @Get('projects/:projectId/uptime-history')
  getUptimeHistory(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analyticsService.getUptimeHistory(projectId, query.range);
  }

  @Get('projects/:projectId/timing-breakdown')
  getTimingBreakdown(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analyticsService.getTimingBreakdown(projectId, query.range);
  }

  @Get('projects/:projectId/network-flow')
  getNetworkFlowAnalysis(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analyticsService.getNetworkFlowAnalysis(projectId, query.range);
  }
}
