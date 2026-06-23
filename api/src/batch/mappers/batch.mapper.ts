import { RawMetricRow } from '../repositories/batch-influx.repository';
import { CreateSummaryDto } from '../repositories/daily-summary.repository';

export function mapRawRowsToSummaries(
  rows: RawMetricRow[],
  date: string,
): CreateSummaryDto[] {
  const grouped = new Map<
    string,
    {
      latencies: number[];
      isUpChecks: { time: Date; isUp: boolean }[];
      projectId: string;
      url: string;
    }
  >();

  for (const row of rows) {
    if (!grouped.has(row.configId)) {
      grouped.set(row.configId, {
        latencies: [],
        isUpChecks: [],
        projectId: row.projectId,
        url: row.url,
      });
    }

    const group = grouped.get(row.configId)!;

    if (row._field === 'latency' && typeof row._value === 'number') {
      group.latencies.push(row._value);
    } else if (row._field === 'isUp') {
      group.isUpChecks.push({
        time: new Date(row._time),
        isUp: Boolean(row._value),
      });
    }
  }

  const summaries: CreateSummaryDto[] = [];

  for (const [configId, data] of grouped.entries()) {
    const { latencies, isUpChecks, projectId, url } = data;

    isUpChecks.sort((a, b) => a.time.getTime() - b.time.getTime());

    const totalChecks = isUpChecks.length;
    const failedChecks = isUpChecks.filter((v) => !v.isUp).length;
    const uptimePercent =
      totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks) * 100 : 0;

    const avgLatencyMs =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;
    const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : 0;
    const minLatencyMs = latencies.length > 0 ? Math.min(...latencies) : 0;

    let downtimeIncidents = 0;
    let totalDowntimeSeconds = 0;
    let wasUp = true;
    let downtimeStart: Date | null = null;

    for (let i = 0; i < isUpChecks.length; i++) {
      const { time, isUp } = isUpChecks[i];
      if (wasUp && !isUp) {
        downtimeIncidents++;
        downtimeStart = time;
      } else if (!wasUp && isUp && downtimeStart !== null) {
        // Durasi downtime dihitung dari selisih waktu nyata
        const diffSeconds = Math.round(
          (time.getTime() - downtimeStart.getTime()) / 1000,
        );
        totalDowntimeSeconds += diffSeconds;
        downtimeStart = null;
      }
      wasUp = isUp;
    }

    if (downtimeStart !== null && isUpChecks.length > 0) {
      const lastCheckTime = isUpChecks[isUpChecks.length - 1].time;
      const diffSeconds = Math.round(
        (lastCheckTime.getTime() - downtimeStart.getTime()) / 1000,
      );
      totalDowntimeSeconds += diffSeconds;
    }

    summaries.push({
      projectId,
      configId,
      url,
      date,
      avgLatencyMs: Math.round(avgLatencyMs * 100) / 100,
      maxLatencyMs: Math.round(maxLatencyMs * 100) / 100,
      minLatencyMs: Math.round(minLatencyMs * 100) / 100,
      uptimePercent: Math.round(uptimePercent * 100) / 100,
      totalChecks,
      failedChecks,
      downtimeIncidents,
      totalDowntimeSeconds,
    });
  }

  return summaries;
}
