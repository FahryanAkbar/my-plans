import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import {
  AnalyticsRange,
  UPTIME_HISTORY_WINDOW_BY_RANGE,
} from '../enums/analytics-range.enum';
import {
  DowntimeHistoryRow,
  LatencyHistoryRow,
  NetworkFlowRow,
  TimingBreakdownRow,
  UptimeHistoryRow,
  UptimeStatsRow,
} from '../entities/analytics.entity';

@Injectable()
export class AnalyticsInfluxRepository implements OnModuleInit {
  private queryApi!: QueryApi;
  private bucket!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>(
      'INFLUXDB_URL',
      'http://localhost:8086',
    );
    const token = this.configService.get<string>(
      'INFLUXDB_TOKEN',
      'monitoring_admin_token_secret',
    );
    const org = this.configService.get<string>('INFLUXDB_ORG', 'my-plans');
    this.bucket = this.configService.get<string>(
      'INFLUXDB_BUCKET',
      'monitoring',
    );

    const influxDB = new InfluxDB({ url, token });
    this.queryApi = influxDB.getQueryApi(org);
  }

  getLatencyHistory(projectId: string, range: AnalyticsRange) {
    return this.queryApi.collectRows<LatencyHistoryRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["_field"] == "latency")
        |> keep(columns: ["_time", "_value", "configId", "url", "status"])
        |> sort(columns: ["_time"], desc: false)
    `);
  }

  getUptimeStats(projectId: string, range: AnalyticsRange) {
    return this.queryApi.collectRows<UptimeStatsRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["_field"] == "isUp")
        |> keep(columns: ["_time", "_value", "configId", "url"])
    `);
  }

  getDowntimeHistory(projectId: string, range: AnalyticsRange) {
    return this.queryApi.collectRows<DowntimeHistoryRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["status"] == "failed")
        |> keep(columns: ["_time", "_field", "_value", "configId", "url"])
    `);
  }

  getUptimeHistory(projectId: string, range: AnalyticsRange) {
    const windowSize = UPTIME_HISTORY_WINDOW_BY_RANGE[range];

    return this.queryApi.collectRows<UptimeHistoryRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["_field"] == "isUp")
        |> map(fn: (r) => ({ r with _value: if r._value == true then 1.0 else 0.0 }))
        |> aggregateWindow(every: ${windowSize}, fn: mean, createEmpty: false)
        |> map(fn: (r) => ({ r with _value: r._value * 100.0 }))
        |> keep(columns: ["_time", "_value", "configId", "url"])
        |> sort(columns: ["_time"], desc: false)
    `);
  }

  getTimingBreakdown(projectId: string, range: AnalyticsRange) {
    return this.queryApi.collectRows<TimingBreakdownRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["_field"] =~ /Time$/)
        |> mean()
        |> keep(columns: ["_field", "_value", "configId", "url"])
    `);
  }

  getNetworkFlowAnalysis(
    projectId: string,
    range: AnalyticsRange,
  ): Promise<NetworkFlowRow[]> {
    return this.queryApi.collectRows<NetworkFlowRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) =>
            r["_field"] == "dnsTime" or
            r["_field"] == "tcpTime" or
            r["_field"] == "tlsTime" or
            r["_field"] == "ttfbTime" or
            r["_field"] == "downloadTime"
        )
        |> group(columns: ["configId", "url", "_field"])
        |> mean()
        |> group(columns: ["configId", "url"])
        |> pivot(rowKey: ["configId", "url"], columnKey: ["_field"], valueColumn: "_value")
    `);
  }

  getRealtimeMetricsForDigitalTwin(projectId: string) {
    return this.queryApi.collectRows<{
      configId: string;
      latency: number;
      isUp: boolean;
      _time: string;
    }>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -30m)
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["_field"] == "latency" or r["_field"] == "isUp")
        |> last()
        |> pivot(rowKey: ["configId"], columnKey: ["_field"], valueColumn: "_value")
    `);
  }
}

function toFluxString(value: string): string {
  return JSON.stringify(value);
}
