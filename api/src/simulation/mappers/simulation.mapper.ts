import { InfluxBaseRow, InfluxPuppeteerRow, LatencyComparisonResult } from '../entities/simulation.entity';
import { PROFILE_SPECS } from '../enums/simulation-range.enum';

export function mapLatencyComparison(
  puppeteerRows: InfluxPuppeteerRow[],
  baseRows: InfluxBaseRow[],
): LatencyComparisonResult[] {
  const baseLatencyMap = buildBaseLatencyMap(baseRows);
  const mergedPuppeteer = mergePuppeteerRows(puppeteerRows);

  const result: LatencyComparisonResult[] = [];

  for (const [configId, timeMap] of Object.entries(mergedPuppeteer)) {
    const points = Object.values(timeMap);
    if (points.length === 0) continue;

    const url = points[0].url;
    const networkProfile = points[0].networkProfile;
    const spec = PROFILE_SPECS[networkProfile] ?? PROFILE_SPECS.WIFI;

    const series = points.map((p) => {
      const baseLatency = findNearestBaseLatency(
        baseLatencyMap[configId] ?? [],
        new Date(p.time).getTime(),
      );

      const predictedLatency = calculatePredictedLatency(
        baseLatency,
        p.pageSize,
        spec,
      );

      return {
        time: p.time,
        realLatency: p.realLatency,
        predictedLatency,
      };
    });

    series.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    result.push({ configId, url, networkProfile, series });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

type BaseLatencyEntry = { time: number; latency: number };

function buildBaseLatencyMap(
  baseRows: InfluxBaseRow[],
): Record<string, BaseLatencyEntry[]> {
  const map: Record<string, BaseLatencyEntry[]> = {};

  for (const row of baseRows) {
    map[row.configId] ??= [];
    map[row.configId].push({
      time: new Date(row._time).getTime(),
      latency: Number(row._value),
    });
  }

  return map;
}

type MergedPuppeteerEntry = {
  time: string;
  url: string;
  networkProfile: string;
  realLatency: number;
  pageSize: number;
};

function mergePuppeteerRows(
  puppeteerRows: InfluxPuppeteerRow[],
): Record<string, Record<string, MergedPuppeteerEntry>> {
  const merged: Record<string, Record<string, MergedPuppeteerEntry>> = {};

  for (const row of puppeteerRows) {
    const { configId, url, networkProfile, _time, _field, _value } = row;

    merged[configId] ??= {};
    merged[configId][_time] ??= {
      time: _time,
      url,
      networkProfile: networkProfile || 'WIFI',
      realLatency: 0,
      pageSize: 0,
    };

    if (_field === 'latency') {
      merged[configId][_time].realLatency = Number(_value);
    } else if (_field === 'pageSize') {
      merged[configId][_time].pageSize = Number(_value);
    }
  }

  return merged;
}

const FALLBACK_BASE_LATENCY_MS = 50;
const MAX_BASE_LATENCY_DIFF_MS = 30 * 60 * 1000; // 30 minutes

function findNearestBaseLatency(
  baseList: BaseLatencyEntry[],
  checkTime: number,
): number {
  let baseLatency = 0;
  let minDiff = Infinity;

  for (const b of baseList) {
    const diff = Math.abs(b.time - checkTime);
    if (diff < minDiff) {
      minDiff = diff;
      baseLatency = b.latency;
    }
  }

  if (minDiff > MAX_BASE_LATENCY_DIFF_MS || baseLatency === 0) {
    return FALLBACK_BASE_LATENCY_MS;
  }

  return baseLatency;
}

function calculatePredictedLatency(
  baseLatency: number,
  pageSize: number,
  spec: { rtt: number; bandwidth: number },
): number {
  if (spec.bandwidth > 0 && pageSize > 0) {
    const transmissionDelay = (pageSize / spec.bandwidth) * 1000;
    return Math.round(baseLatency + spec.rtt + transmissionDelay);
  }

  return Math.round(baseLatency + spec.rtt);
}
