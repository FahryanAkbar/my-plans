import type {
  LatencyHistoryResponse,
  LatencyDataPoint,
  UptimeHistoryResponse,
  UptimeTrendPoint,
} from '@/types/features';

export interface ChartResult {
  sortedData: Record<string, number>[];
  minTime: number;
  maxTime: number;
  ticks: number[];
}

export interface LatencyChartPoint {
  timestamp: number;
  latencyMs: number;
}

export interface UptimeChartPoint {
  timestamp: number;
  uptimePercentage: number;
}

function buildTicks(minTime: number, maxTime: number): number[] {
  if (minTime === maxTime) return [minTime];
  const span = maxTime - minTime;
  const ticks: number[] = [];
  for (let i = 0; i <= 4; i++) {
    ticks.push(minTime + (span / 4) * i);
  }
  return ticks;
}

export interface LatencyChartData {
  sortedData: LatencyChartPoint[];
  minTime: number;
  maxTime: number;
  ticks: number[];
  maxYDomain: number;
}

const LATENCY_EMPTY: LatencyChartData = {
  sortedData: [],
  minTime: 0,
  maxTime: 0,
  ticks: [],
  maxYDomain: 100,
};

export function normalizeLatencyData(
  responses: LatencyHistoryResponse[],
): LatencyChartData {
  if (!responses || responses.length === 0) return LATENCY_EMPTY;

  const points: LatencyChartPoint[] = [];

  responses.forEach((resp: LatencyHistoryResponse) => {
    if (!Array.isArray(resp.series)) return;
    resp.series.forEach((dp: LatencyDataPoint) => {
      const ts = Date.parse(dp.time);
      if (!isNaN(ts)) {
        points.push({ timestamp: ts, latencyMs: dp.latency });
      }
    });
  });

  if (points.length === 0) return LATENCY_EMPTY;

  points.sort((a, b) => a.timestamp - b.timestamp);

  const timestamps = points.map((p) => p.timestamp);
  const latencies  = points.map((p) => p.latencyMs);
  const minTime    = Math.min(...timestamps);
  const maxTime    = Math.max(...timestamps);
  const maxY       = Math.max(...latencies);

  return {
    sortedData: points,
    minTime,
    maxTime,
    ticks: buildTicks(minTime, maxTime),
    maxYDomain: Math.max(Math.ceil(maxY / 50) * 50, 100),
  };
}

export interface UptimeChartData {
  sortedData: UptimeChartPoint[];
  minTime: number;
  maxTime: number;
  ticks: number[];
  minYDomain: number;
  maxYDomain: number;
}

const UPTIME_EMPTY: UptimeChartData = {
  sortedData: [],
  minTime: 0,
  maxTime: 0,
  ticks: [],
  minYDomain: 0,
  maxYDomain: 100,
};

export function normalizeUptimeData(
  responses: UptimeHistoryResponse[],
): UptimeChartData {
  if (!responses || responses.length === 0) return UPTIME_EMPTY;

  const points: UptimeChartPoint[] = [];

  responses.forEach((resp: UptimeHistoryResponse) => {
    if (!Array.isArray(resp.series)) return;
    resp.series.forEach((dp: UptimeTrendPoint) => {
      const ts = Date.parse(dp.time);
      if (!isNaN(ts)) {
        points.push({ timestamp: ts, uptimePercentage: dp.uptimePercentage });
      }
    });
  });

  if (points.length === 0) return UPTIME_EMPTY;

  points.sort((a, b) => a.timestamp - b.timestamp);

  const timestamps = points.map((p) => p.timestamp);
  const uptimeVals = points.map((p) => p.uptimePercentage);
  const minTime    = Math.min(...timestamps);
  const maxTime    = Math.max(...timestamps);
  const minUptime  = Math.min(...uptimeVals);

  const minYDomain = Math.max(0, Math.floor((minUptime - 5) / 5) * 5);

  return {
    sortedData: points,
    minTime,
    maxTime,
    ticks: buildTicks(minTime, maxTime),
    minYDomain,
    maxYDomain: 100,
  };
}
