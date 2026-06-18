/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';

@Injectable()
export class AnalyticsService implements OnModuleInit {
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

  /**
   * Retrieves the historical latency checks for all configs under a project.
   */
  async getLatencyHistory(projectId: string, range: string = '1h') {
    // Validate range parameter to prevent Flux injection
    const validRanges = ['1h', '6h', '12h', '24h', '7d', '30d'];
    const cleanRange = validRanges.includes(range) ? range : '1h';

    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["_field"] == "latency")
        |> keep(columns: ["_time", "_value", "configId", "url", "status"])
        |> sort(columns: ["_time"], desc: false)
    `;

    const rows = await this.queryApi.collectRows<any>(fluxQuery);

    // Group rows by configId
    const grouped: Record<
      string,
      {
        configId: string;
        url: string;
        series: Array<{ time: string; latency: number; status: string }>;
      }
    > = {};
    for (const row of rows) {
      const { configId, url, _time, _value, status } = row as {
        configId: string;
        url: string;
        _time: string;
        _value: number;
        status: string;
      };
      if (!grouped[configId]) {
        grouped[configId] = {
          configId,
          url,
          series: [],
        };
      }
      grouped[configId].series.push({
        time: _time,
        latency: _value,
        status,
      });
    }

    return Object.values(grouped);
  }

  /**
   * Calculates uptime stats (percentage, total successful/failed checks) for all configs under a project.
   */
  async getUptimeStats(projectId: string, range: string = '24h') {
    const validRanges = ['1h', '6h', '12h', '24h', '7d', '30d'];
    const cleanRange = validRanges.includes(range) ? range : '24h';

    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["_field"] == "isUp")
        |> keep(columns: ["_time", "_value", "configId", "url"])
    `;

    const rows = await this.queryApi.collectRows<any>(fluxQuery);

    const stats: Record<
      string,
      {
        configId: string;
        url: string;
        totalChecks: number;
        successCount: number;
        failCount: number;
      }
    > = {};
    for (const row of rows) {
      const { configId, url, _value } = row;
      if (!stats[configId]) {
        stats[configId] = {
          configId,
          url,
          totalChecks: 0,
          successCount: 0,
          failCount: 0,
        };
      }
      stats[configId].totalChecks++;
      if (_value === true || _value === 'true') {
        stats[configId].successCount++;
      } else {
        stats[configId].failCount++;
      }
    }

    // Map stats and calculate uptime percentages
    return Object.values(stats).map((stat) => {
      const uptimePercentage =
        stat.totalChecks > 0
          ? parseFloat(
              ((stat.successCount / stat.totalChecks) * 100).toFixed(3),
            )
          : 100.0;
      return {
        ...stat,
        uptimePercentage,
      };
    });
  }

  /**
   * Retrieves log history of recent downtime events (checks that failed) under a project.
   */
  async getDowntimeHistory(projectId: string, range: string = '7d') {
    const validRanges = ['24h', '7d', '30d'];
    const cleanRange = validRanges.includes(range) ? range : '7d';

    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["status"] == "failed")
        |> keep(columns: ["_time", "_field", "_value", "configId", "url"])
    `;

    const rows = await this.queryApi.collectRows<any>(fluxQuery);

    // Group fields (latency, statusCode, errorMessage) back into single event objects by configId + timestamp
    const eventsMap: Record<
      string,
      {
        configId: string;
        url: string;
        time: string;
        latency: number;
        statusCode: number;
        errorMessage: string;
      }
    > = {};
    for (const row of rows) {
      const { configId, url, _time, _field, _value } = row;
      const key = `${configId}_${_time}`;
      if (!eventsMap[key]) {
        eventsMap[key] = {
          configId,
          url,
          time: _time,
          latency: 0,
          statusCode: 0,
          errorMessage: '',
        };
      }

      if (_field === 'latency') {
        eventsMap[key].latency = Number(_value);
      } else if (_field === 'statusCode') {
        eventsMap[key].statusCode = Number(_value);
      } else if (_field === 'errorMessage') {
        eventsMap[key].errorMessage = String(_value);
      }
    }

    // Return events list sorted by timestamp descending
    return Object.values(eventsMap).sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }

  /**
   * Retrieves the historical uptime percentage trend (time-series) for all configs under a project.
   */
  async getUptimeHistory(projectId: string, range: string = '30d') {
    // Validate range parameter to prevent Flux injection
    const validRanges = ['1h', '6h', '12h', '24h', '7d', '30d'];
    const cleanRange = validRanges.includes(range) ? range : '30d';

    // Map range to a reasonable aggregation window size
    const windowMap: Record<string, string> = {
      '1h': '5m',
      '6h': '15m',
      '12h': '30m',
      '24h': '1h',
      '7d': '12h',
      '30d': '1d',
    };
    const windowSize = windowMap[cleanRange] || '1d';

    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["_field"] == "isUp")
        // Map boolean isUp true -> 1.0 and false -> 0.0
        |> map(fn: (r) => ({ r with _value: if r._value == true then 1.0 else 0.0 }))
        // Group and calculate the average (mean) success rate for each window
        |> aggregateWindow(every: ${windowSize}, fn: mean, createEmpty: false)
        // Convert mean (0.0 to 1.0) to percentage (0.0 to 100.0)
        |> map(fn: (r) => ({ r with _value: r._value * 100.0 }))
        |> keep(columns: ["_time", "_value", "configId", "url"])
        |> sort(columns: ["_time"], desc: false)
    `;

    const rows = await this.queryApi.collectRows<any>(fluxQuery);

    // Group rows by configId
    const grouped: Record<
      string,
      {
        configId: string;
        url: string;
        series: Array<{ time: string; uptimePercentage: number }>;
      }
    > = {};

    for (const row of rows) {
      const { configId, url, _time, _value } = row as {
        configId: string;
        url: string;
        _time: string;
        _value: number;
      };
      if (!grouped[configId]) {
        grouped[configId] = {
          configId,
          url,
          series: [],
        };
      }
      grouped[configId].series.push({
        time: _time,
        uptimePercentage: parseFloat(_value.toFixed(3)),
      });
    }

    return Object.values(grouped);
  }

  /**
   * Retrieves the average network timing breakdown (DNS, TCP, TLS, TTFB, Download) for all configs under a project.
   */
  async getTimingBreakdown(projectId: string, range: string = '24h') {
    const validRanges = ['1h', '6h', '12h', '24h', '7d', '30d'];
    const cleanRange = validRanges.includes(range) ? range : '24h';

    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["_field"] =~ /Time$/)
        |> mean()
        |> keep(columns: ["_field", "_value", "configId", "url"])
    `;

    const rows = await this.queryApi.collectRows<any>(fluxQuery);

    const grouped: Record<
      string,
      {
        configId: string;
        url: string;
        dns: number;
        tcp: number;
        tls: number;
        ttfb: number;
        download: number;
      }
    > = {};

    for (const row of rows) {
      const { configId, url, _field, _value } = row as {
        configId: string;
        url: string;
        _field: string;
        _value: number;
      };

      if (!grouped[configId]) {
        grouped[configId] = {
          configId,
          url,
          dns: 0,
          tcp: 0,
          tls: 0,
          ttfb: 0,
          download: 0,
        };
      }

      const val = _value ? parseFloat(_value.toFixed(2)) : 0;
      if (_field === 'dnsTime') {
        grouped[configId].dns = val;
      } else if (_field === 'tcpTime') {
        grouped[configId].tcp = val;
      } else if (_field === 'tlsTime') {
        grouped[configId].tls = val;
      } else if (_field === 'ttfbTime') {
        grouped[configId].ttfb = val;
      } else if (_field === 'downloadTime') {
        grouped[configId].download = val;
      }
    }

    return Object.values(grouped);
  }
}
