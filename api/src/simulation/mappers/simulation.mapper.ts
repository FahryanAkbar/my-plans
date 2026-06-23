import {
  InfluxBaseRow,
  InfluxPuppeteerRow,
  LatencyComparisonResult,
  QosAnalysisResult,
  QosInfluxRow,
} from '../entities/simulation.entity';
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

export function mapQosAnalysis(rows: QosInfluxRow[]): QosAnalysisResult[] {
  const grouped: Record<
    string,
    {
      configId: string;
      url: string;
      profiles: Record<string, { latency: number; isUp: number }>;
    }
  > = {};

  for (const row of rows) {
    grouped[row.configId] ??= {
      configId: row.configId,
      url: row.url,
      profiles: {},
    };

    grouped[row.configId].profiles[row.networkProfile] = {
      latency: Number((row.latency ?? 0).toFixed(2)),
      isUp: Number(row.isUp ?? 0),
    };
  }

  return Object.values(grouped).map(({ configId, url, profiles }) => {
    // Tentukan base latency (WiFi equivalent)
    let baseLatency = 50; // fallback default
    let baseIsUp = 1; // fallback default

    if (profiles['WIFI']) {
      baseLatency = profiles['WIFI'].latency;
      baseIsUp = profiles['WIFI'].isUp;
    } else {
      const availableProfile = Object.keys(profiles)[0];
      if (availableProfile) {
        const spec = PROFILE_SPECS[availableProfile] ?? PROFILE_SPECS.WIFI;
        baseLatency = Math.max(
          0,
          profiles[availableProfile].latency - spec.rtt,
        );
        baseIsUp = profiles[availableProfile].isUp;
      }
    }

    const calculatedProfiles: Record<
      string,
      {
        avgLatencyMs: number;
        uptimePercent: number;
        qosScore: number;
      }
    > = {};

    const targetProfiles = ['WIFI', 'NETWORK_4G', 'NETWORK_3G'];
    const allProfiles = Array.from(
      new Set([...targetProfiles, ...Object.keys(profiles)]),
    );

    for (const profile of allProfiles) {
      let avgLatencyMs: number;
      let uptimePercent: number;

      if (profiles[profile]) {
        avgLatencyMs = profiles[profile].latency;
        uptimePercent = Number((profiles[profile].isUp * 100).toFixed(2));
      } else {
        const spec = PROFILE_SPECS[profile] ?? PROFILE_SPECS.WIFI;
        avgLatencyMs = Number((baseLatency + spec.rtt).toFixed(2));
        uptimePercent = Number((baseIsUp * 100).toFixed(2));
      }

      const latencyScore = Math.max(0, 100 - avgLatencyMs / 50);
      const qosScore = Number(
        (uptimePercent * 0.6 + latencyScore * 0.4).toFixed(1),
      );

      calculatedProfiles[profile] = { avgLatencyMs, uptimePercent, qosScore };
    }

    const profileEntries = Object.entries(calculatedProfiles);
    let bestProfile = '';
    let worstProfile = '';

    if (profileEntries.length > 0) {
      bestProfile = profileEntries.reduce((a, b) => {
        if (b[1].qosScore !== a[1].qosScore) {
          return b[1].qosScore > a[1].qosScore ? b : a;
        }
        return b[1].avgLatencyMs < a[1].avgLatencyMs ? b : a;
      })[0];
      worstProfile = profileEntries.reduce((a, b) => {
        if (b[1].qosScore !== a[1].qosScore) {
          return b[1].qosScore < a[1].qosScore ? b : a;
        }
        return b[1].avgLatencyMs > a[1].avgLatencyMs ? b : a;
      })[0];
    }

    return {
      configId,
      url,
      profiles: calculatedProfiles,
      bestProfile,
      worstProfile,
    };
  });
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
