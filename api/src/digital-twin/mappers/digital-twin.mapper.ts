import { DailySummary } from '../../batch/entities/summary.entity';
import { MonitoringConfig } from '../../projects/entities/monitoring-config.entity';
import { TwinObject } from '../interfaces/twin-object.interface';
import { RealtimeMetric } from '../interfaces/realtime-metric.interface';
import {
  calculateStatus,
  calculateHealth,
  calculateTrend,
} from '../utils/digital-twin.utils';

export interface InfluxRealtimeRow {
  configId: string;
  latency?: number;
  isUp?: boolean | string | number;
  _time: string;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function buildRealtimeMetricsMap(
  rows: InfluxRealtimeRow[],
): Map<string, RealtimeMetric> {
  const result = new Map<string, RealtimeMetric>();
  for (const row of rows) {
    result.set(row.configId, {
      latencyMs: row.latency ?? 0,
      isUp: row.isUp !== undefined ? Boolean(row.isUp) : false,
      lastCheckedAt: row._time,
    });
  }
  return result;
}

export function mapToTwinObjects(
  configs: MonitoringConfig[],
  realtimeMap: Map<string, RealtimeMetric>,
  dailySummaries: DailySummary[],
): TwinObject[] {
  const summaryMap = new Map(dailySummaries.map((s) => [s.configId, s]));

  return configs
    .filter((config) => config.enabled && !config.isArchived)
    .map((config) => {
      const rt = realtimeMap.get(config.id);
      const daily = summaryMap.get(config.id);

      const latencyMs = rt?.latencyMs ?? 0;
      const isUp = rt ? rt.isUp : null;
      const uptimePercent = daily?.uptimePercent ?? 100;
      const avgLatencyMs = daily?.avgLatencyMs ?? 0;

      return new TwinObject({
        configId: config.id,
        projectId: config.projectId,
        url: config.url,
        name: config.name,
        status: calculateStatus(isUp, latencyMs, config.timeout),
        latencyMs,
        lastCheckedAt:
          rt?.lastCheckedAt ?? config.lastCheckedAt?.toISOString() ?? '',
        uptimePercent,
        avgLatencyMs,
        downtimeIncidents: daily?.downtimeIncidents ?? 0,
        twinHealth: calculateHealth(uptimePercent, latencyMs, config.timeout),
        trend: calculateTrend(latencyMs, avgLatencyMs),
      });
    });
}
