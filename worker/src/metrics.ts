import { InfluxDB, Point, type WriteApi } from '@influxdata/influxdb-client';
import { config } from './config.js';
import type { MonitoringJobData, MonitoringResult } from './types.js';

export function createWriteApi(): WriteApi {
  const influxDB = new InfluxDB({
    url: config.influx.url,
    token: config.influx.token,
  });

  return influxDB.getWriteApi(config.influx.org, config.influx.bucket, 'ms');
}

export async function writeMonitoringMetric(
  writeApi: WriteApi,
  jobData: MonitoringJobData,
  result: MonitoringResult,
): Promise<void> {
  const point = new Point('http_checks')
    .tag('projectId', jobData.projectId)
    .tag('configId', jobData.configId)
    .tag('url', jobData.url)
    .tag('status', result.isUp ? 'success' : 'failed')
    .tag('engine', jobData.engine ?? 'HTTP')
    .tag('networkProfile', jobData.networkProfile ?? 'WIFI')
    .floatField('latency', result.ping.latency)
    .intField('statusCode', result.ping.statusCode)
    .booleanField('isUp', result.isUp)
    .booleanField('sslValid', result.ssl.valid)
    .stringField('errorMessage', result.errorMessage || '');

  if (result.ssl.daysRemaining !== undefined) {
    point.intField('sslDaysRemaining', result.ssl.daysRemaining);
  }

  if (result.ping.pageSize !== undefined) {
    point.intField('pageSize', result.ping.pageSize);
  }

  if (result.ping.timings) {
    point
      .floatField('dnsTime', result.ping.timings.dns)
      .floatField('tcpTime', result.ping.timings.tcp)
      .floatField('tlsTime', result.ping.timings.tls)
      .floatField('ttfbTime', result.ping.timings.ttfb)
      .floatField('downloadTime', result.ping.timings.download);
  }

  writeApi.writePoint(point);
  await writeApi.flush();
}
