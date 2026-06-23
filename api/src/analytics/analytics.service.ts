import { Injectable } from '@nestjs/common';
import { AnalyticsInfluxRepository } from './repositories/analytics-influx.repository';
import {
  DEFAULT_DOWNTIME_RANGE,
  DEFAULT_LATENCY_RANGE,
  DEFAULT_TIMING_BREAKDOWN_RANGE,
  DEFAULT_UPTIME_HISTORY_RANGE,
  DEFAULT_UPTIME_STATS_RANGE,
  DEFAULT_NETWORK_FLOW_RANGE,
  DOWNTIME_ANALYTICS_RANGES,
  STANDARD_ANALYTICS_RANGES,
  AnalyticsRange,
} from './enums/analytics-range.enum';
import {
  mapDowntimeHistory,
  mapLatencyHistory,
  mapNetworkFlowAnalysis,
  mapTimingBreakdown,
  mapUptimeHistory,
  mapUptimeStats,
} from './mappers/analytics.mapper';
import { NetworkFlowAnalysis } from './entities/analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsInfluxRepository,
  ) {}

  async getLatencyHistory(projectId: string, range?: string) {
    const cleanRange = resolveRange(
      range,
      STANDARD_ANALYTICS_RANGES,
      DEFAULT_LATENCY_RANGE,
    );
    const rows = await this.analyticsRepository.getLatencyHistory(
      projectId,
      cleanRange,
    );

    return mapLatencyHistory(rows);
  }

  async getUptimeStats(projectId: string, range?: string) {
    const cleanRange = resolveRange(
      range,
      STANDARD_ANALYTICS_RANGES,
      DEFAULT_UPTIME_STATS_RANGE,
    );
    const rows = await this.analyticsRepository.getUptimeStats(
      projectId,
      cleanRange,
    );

    return mapUptimeStats(rows);
  }

  async getDowntimeHistory(projectId: string, range?: string) {
    const cleanRange = resolveRange(
      range,
      DOWNTIME_ANALYTICS_RANGES,
      DEFAULT_DOWNTIME_RANGE,
    );
    const rows = await this.analyticsRepository.getDowntimeHistory(
      projectId,
      cleanRange,
    );

    return mapDowntimeHistory(rows);
  }

  async getUptimeHistory(projectId: string, range?: string) {
    const cleanRange = resolveRange(
      range,
      STANDARD_ANALYTICS_RANGES,
      DEFAULT_UPTIME_HISTORY_RANGE,
    );
    const rows = await this.analyticsRepository.getUptimeHistory(
      projectId,
      cleanRange,
    );

    return mapUptimeHistory(rows);
  }

  async getTimingBreakdown(projectId: string, range?: string) {
    const cleanRange = resolveRange(
      range,
      STANDARD_ANALYTICS_RANGES,
      DEFAULT_TIMING_BREAKDOWN_RANGE,
    );
    const rows = await this.analyticsRepository.getTimingBreakdown(
      projectId,
      cleanRange,
    );

    return mapTimingBreakdown(rows);
  }

  async getNetworkFlowAnalysis(
    projectId: string,
    range?: string,
  ): Promise<NetworkFlowAnalysis[]> {
    const cleanRange = resolveRange(
      range,
      STANDARD_ANALYTICS_RANGES,
      DEFAULT_NETWORK_FLOW_RANGE,
    );
    const rows = await this.analyticsRepository.getNetworkFlowAnalysis(
      projectId,
      cleanRange,
    );
    return mapNetworkFlowAnalysis(rows);
  }
}

function resolveRange(
  range: string | undefined,
  allowedRanges: readonly AnalyticsRange[],
  fallback: AnalyticsRange,
): AnalyticsRange {
  return allowedRanges.includes(range as AnalyticsRange)
    ? (range as AnalyticsRange)
    : fallback;
}
