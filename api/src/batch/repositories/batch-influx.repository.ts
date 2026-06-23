import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';

export interface RawMetricRow {
  _time: string;
  _value: number | boolean;
  _field: string;
  configId: string;
  projectId: string;
  url: string;
  status: string;
}

@Injectable()
export class BatchInfluxRepository implements OnModuleInit {
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

  async getRawMetricsForDate(dateStr: string): Promise<RawMetricRow[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD.`);
    }

    const startOfDay = `${dateStr}T00:00:00Z`;
    const endOfDay = `${dateStr}T23:59:59Z`;

    const query = `
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: ${startOfDay}, stop: ${endOfDay})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["_field"] == "latency" or r["_field"] == "isUp")
        |> keep(columns: ["_time", "_field", "_value", "configId", "projectId", "url", "status"])
    `;

    return this.queryApi.collectRows<RawMetricRow>(query);
  }
}

function toFluxString(value: string): string {
  return JSON.stringify(value);
}
