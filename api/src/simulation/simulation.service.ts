import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';

@Injectable()
export class SimulationService implements OnModuleInit {
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
   * Retrieves the historical comparison between predicted latency and real latency.
   */
  async getLatencyComparison(
    projectId: string,
    range: string = '24h',
  ): Promise<
    Array<{
      configId: string;
      url: string;
      networkProfile: string;
      series: Array<{
        time: string;
        realLatency: number;
        predictedLatency: number;
      }>;
    }>
  > {
    const validRanges = ['1h', '6h', '12h', '24h', '7d', '30d'];
    const cleanRange = validRanges.includes(range) ? range : '24h';

    // 1. Fetch Puppeteer checks (which have latency, pageSize, and networkProfile)
    const puppeteerQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["engine"] == "PUPPETEER")
        |> filter(fn: (r) => r["_field"] == "latency" or r["_field"] == "pageSize")
        |> keep(columns: ["_time", "_field", "_value", "configId", "url", "networkProfile"])
        |> sort(columns: ["_time"], desc: false)
    `;

    // 2. Fetch HTTP/WIFI checks (which provide the baseline latency/ping)
    const baseQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${cleanRange})
        |> filter(fn: (r) => r["_measurement"] == "http_checks")
        |> filter(fn: (r) => r["projectId"] == "${projectId}")
        |> filter(fn: (r) => r["engine"] == "HTTP" or r["networkProfile"] == "WIFI")
        |> filter(fn: (r) => r["_field"] == "latency")
        |> keep(columns: ["_time", "_value", "configId"])
        |> sort(columns: ["_time"], desc: false)
    `;

    const [puppeteerRows, baseRows] = await Promise.all([
      this.queryApi.collectRows<any>(puppeteerQuery),
      this.queryApi.collectRows<any>(baseQuery),
    ]);

    // Group base/HTTP checks by configId and time
    const baseLatencyMap: Record<
      string,
      Array<{ time: number; latency: number }>
    > = {};
    for (const row of baseRows) {
      const { configId, _time, _value } = row as {
        configId: string;
        _time: string;
        _value: number;
      };
      if (!baseLatencyMap[configId]) {
        baseLatencyMap[configId] = [];
      }
      baseLatencyMap[configId].push({
        time: new Date(_time).getTime(),
        latency: Number(_value),
      });
    }

    // Group Puppeteer checks by configId and timestamp (merging latency and pageSize fields)
    const mergedPuppeteer: Record<
      string,
      Record<
        string,
        {
          time: string;
          url: string;
          networkProfile: string;
          realLatency: number;
          pageSize: number;
        }
      >
    > = {};

    for (const row of puppeteerRows) {
      const { configId, url, networkProfile, _time, _field, _value } = row as {
        configId: string;
        url: string;
        networkProfile: string;
        _time: string;
        _field: string;
        _value: string;
      };
      if (!mergedPuppeteer[configId]) {
        mergedPuppeteer[configId] = {};
      }
      if (!mergedPuppeteer[configId][_time]) {
        mergedPuppeteer[configId][_time] = {
          time: _time,
          url,
          networkProfile: networkProfile || 'WIFI',
          realLatency: 0,
          pageSize: 0,
        };
      }

      if (_field === 'latency') {
        mergedPuppeteer[configId][_time].realLatency = Number(_value);
      } else if (_field === 'pageSize') {
        mergedPuppeteer[configId][_time].pageSize = Number(_value);
      }
    }

    // Throttling specifications mapping
    const PROFILE_SPECS: Record<string, { rtt: number; bandwidth: number }> = {
      WIFI: { rtt: 0, bandwidth: -1 },
      NETWORK_4G: { rtt: 20, bandwidth: (4 * 1024 * 1024) / 8 }, // 4 Mbps in B/s
      NETWORK_3G: { rtt: 300, bandwidth: (500 * 1024) / 8 }, // 500 Kbps in B/s
      FAST_3G: { rtt: 150, bandwidth: (1.5 * 1024 * 1024) / 8 }, // 1.5 Mbps in B/s
    };

    const result: Array<{
      configId: string;
      url: string;
      networkProfile: string;
      series: Array<{
        time: string;
        realLatency: number;
        predictedLatency: number;
      }>;
    }> = [];

    for (const [configId, timeMap] of Object.entries(mergedPuppeteer)) {
      const points = Object.values(timeMap);
      if (points.length === 0) continue;

      const url = points[0].url;
      const networkProfile = points[0].networkProfile;
      const spec = PROFILE_SPECS[networkProfile] || PROFILE_SPECS.WIFI;

      const series: Array<{
        time: string;
        realLatency: number;
        predictedLatency: number;
      }> = [];

      for (const p of points) {
        const checkTime = new Date(p.time).getTime();

        // Find the nearest base latency check for this config
        const baseList = baseLatencyMap[configId] || [];
        let baseLatency = 0;
        let minDiff = Infinity;

        for (const b of baseList) {
          const diff = Math.abs(b.time - checkTime);
          if (diff < minDiff) {
            minDiff = diff;
            baseLatency = b.latency;
          }
        }

        // If no base check is within 30 minutes, or not found, fallback to 50ms
        if (minDiff > 30 * 60 * 1000 || baseLatency === 0) {
          baseLatency = 50;
        }

        // Calculate predicted latency using the transmission formula:
        // Predicted = Base Latency + Profile RTT + (Page Size / Bandwidth) * 1000
        let predictedLatency = baseLatency;
        if (spec.bandwidth > 0 && p.pageSize > 0) {
          const transmissionDelay = (p.pageSize / spec.bandwidth) * 1000;
          predictedLatency = baseLatency + spec.rtt + transmissionDelay;
        } else {
          predictedLatency = baseLatency + spec.rtt;
        }

        series.push({
          time: p.time,
          realLatency: p.realLatency,
          predictedLatency: Math.round(predictedLatency),
        });
      }

      // Sort series chronologically
      series.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      result.push({
        configId,
        url,
        networkProfile,
        series,
      });
    }

    return result;
  }
}
