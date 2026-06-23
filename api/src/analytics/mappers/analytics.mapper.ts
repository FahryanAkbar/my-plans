import { AnalyticsField } from '../enums/analytics-field.enum';
import {
  DowntimeEvent,
  DowntimeHistoryRow,
  LatencyHistory,
  LatencyHistoryRow,
  NetworkFlowAnalysis,
  NetworkFlowRow,
  TimingBreakdown,
  TimingBreakdownRow,
  UptimeHistory,
  UptimeHistoryRow,
  UptimeStats,
  UptimeStatsRow,
} from '../entities/analytics.entity';

export function mapLatencyHistory(rows: LatencyHistoryRow[]): LatencyHistory[] {
  const grouped: Record<string, LatencyHistory> = {};

  for (const row of rows) {
    grouped[row.configId] ??= {
      configId: row.configId,
      url: row.url,
      series: [],
    };

    grouped[row.configId].series.push({
      time: row._time,
      latency: row._value,
      status: row.status,
    });
  }

  return Object.values(grouped);
}

export function mapUptimeStats(rows: UptimeStatsRow[]): UptimeStats[] {
  const stats: Record<string, Omit<UptimeStats, 'uptimePercentage'>> = {};

  for (const row of rows) {
    stats[row.configId] ??= {
      configId: row.configId,
      url: row.url,
      totalChecks: 0,
      successCount: 0,
      failCount: 0,
    };

    stats[row.configId].totalChecks++;
    if (row._value === true || row._value === 'true') {
      stats[row.configId].successCount++;
    } else {
      stats[row.configId].failCount++;
    }
  }

  return Object.values(stats).map((stat) => ({
    ...stat,
    uptimePercentage:
      stat.totalChecks > 0
        ? Number(((stat.successCount / stat.totalChecks) * 100).toFixed(3))
        : 100,
  }));
}

export function mapDowntimeHistory(
  rows: DowntimeHistoryRow[],
): DowntimeEvent[] {
  const events: Record<string, DowntimeEvent> = {};

  for (const row of rows) {
    const key = `${row.configId}_${row._time}`;
    events[key] ??= {
      configId: row.configId,
      url: row.url,
      time: row._time,
      latency: 0,
      statusCode: 0,
      errorMessage: '',
    };

    if (row._field === AnalyticsField.LATENCY) {
      events[key].latency = Number(row._value);
    } else if (row._field === AnalyticsField.STATUS_CODE) {
      events[key].statusCode = Number(row._value);
    } else if (row._field === AnalyticsField.ERROR_MESSAGE) {
      events[key].errorMessage = String(row._value);
    }
  }

  return Object.values(events).sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  );
}

export function mapUptimeHistory(rows: UptimeHistoryRow[]): UptimeHistory[] {
  const grouped: Record<string, UptimeHistory> = {};

  for (const row of rows) {
    grouped[row.configId] ??= {
      configId: row.configId,
      url: row.url,
      series: [],
    };

    grouped[row.configId].series.push({
      time: row._time,
      uptimePercentage: Number(row._value.toFixed(3)),
    });
  }

  return Object.values(grouped);
}

export function mapTimingBreakdown(
  rows: TimingBreakdownRow[],
): TimingBreakdown[] {
  const grouped: Record<string, TimingBreakdown> = {};

  for (const row of rows) {
    grouped[row.configId] ??= {
      configId: row.configId,
      url: row.url,
      dns: 0,
      tcp: 0,
      tls: 0,
      ttfb: 0,
      download: 0,
    };

    const value = row._value ? Number(row._value.toFixed(2)) : 0;
    if (row._field === AnalyticsField.DNS_TIME) {
      grouped[row.configId].dns = value;
    } else if (row._field === AnalyticsField.TCP_TIME) {
      grouped[row.configId].tcp = value;
    } else if (row._field === AnalyticsField.TLS_TIME) {
      grouped[row.configId].tls = value;
    } else if (row._field === AnalyticsField.TTFB_TIME) {
      grouped[row.configId].ttfb = value;
    } else if (row._field === AnalyticsField.DOWNLOAD_TIME) {
      grouped[row.configId].download = value;
    }
  }

  return Object.values(grouped);
}

export function mapNetworkFlowAnalysis(
  rows: NetworkFlowRow[],
): NetworkFlowAnalysis[] {
  return rows.map((row) => {
    const dns = round(row.dnsTime ?? 0);
    const tcp = round(row.tcpTime ?? 0);
    const tls = round(row.tlsTime ?? 0);
    const ttfb = round(row.ttfbTime ?? 0);
    const download = round(row.downloadTime ?? 0);

    const totalNetworkTime = round(dns + tcp + tls + ttfb + download);

    const timings: Record<
      Exclude<NetworkFlowAnalysis['bottleneck'], null>,
      number
    > = {
      dnsTime: dns,
      tcpTime: tcp,
      tlsTime: tls,
      ttfbTime: ttfb,
      downloadTime: download,
    };

    const bottleneck =
      totalNetworkTime > 0
        ? (
            Object.entries(timings) as [
              Exclude<NetworkFlowAnalysis['bottleneck'], null>,
              number,
            ][]
          ).reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0]
        : null;

    return {
      configId: row.configId,
      url: row.url,
      dnsTime: dns,
      tcpTime: tcp,
      tlsTime: tls,
      ttfbTime: ttfb,
      downloadTime: download,
      totalNetworkTime,
      bottleneck,
    };
  });
}

function round(value: number, decimals = 2): number {
  return Number(value.toFixed(decimals));
}
