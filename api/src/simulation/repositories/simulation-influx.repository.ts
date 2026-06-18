import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { SimulationRange } from '../enums/simulation-range.enum';
import {
  InfluxBaseRow,
  InfluxPuppeteerRow,
} from '../entities/simulation.entity';

@Injectable()
export class SimulationInfluxRepository implements OnModuleInit {
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

  getPuppeteerRows(
    projectId: string,
    range: SimulationRange,
  ): Promise<InfluxPuppeteerRow[]> {
    return this.queryApi.collectRows<InfluxPuppeteerRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["engine"] == "PUPPETEER")
        |> filter(fn: (r) => r["_field"] == "latency" or r["_field"] == "pageSize")
        |> keep(columns: ["_time", "_field", "_value", "configId", "url", "networkProfile"])
        |> sort(columns: ["_time"], desc: false)
    `);
  }

  getBaseRows(
    projectId: string,
    range: SimulationRange,
  ): Promise<InfluxBaseRow[]> {
    return this.queryApi.collectRows<InfluxBaseRow>(`
      from(bucket: ${toFluxString(this.bucket)})
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == ${toFluxString(projectId)})
        |> filter(fn: (r) => r["engine"] == "HTTP" or r["networkProfile"] == "WIFI")
        |> filter(fn: (r) => r["_field"] == "latency")
        |> keep(columns: ["_time", "_value", "configId"])
        |> sort(columns: ["_time"], desc: false)
    `);
  }
}

function toFluxString(value: string): string {
  return JSON.stringify(value);
}
