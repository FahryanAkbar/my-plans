import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export interface WorkerStatus {
  hostname: string;
  pid: number;
  uptime: number;
  memory: number; // in MB
  activeJobs: number;
  timestamp: string;
}

export interface HealthStatus {
  status: 'UP' | 'DOWN';
  details: {
    postgres: { status: 'UP' | 'DOWN'; latencyMs?: number; error?: string };
    redis: { status: 'UP' | 'DOWN'; latencyMs?: number; error?: string };
    influxdb: { status: 'UP' | 'DOWN'; latencyMs?: number; error?: string };
  };
}

@Injectable()
export class MonitoringService {
  constructor(
    @InjectQueue('monitoring-queue')
    private readonly monitoringQueue: Queue,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  private getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  /**
   * Scans and retrieves all active worker heartbeats from Redis.
   */
  async getWorkersStatus(): Promise<WorkerStatus[]> {
    const client = (await this.monitoringQueue.client) as unknown as Redis;
    let cursor = '0';
    const keys: string[] = [];

    try {
      do {
        const [nextCursor, foundKeys] = await client.scan(
          cursor,
          'MATCH',
          'worker:heartbeat:*',
          'COUNT',
          100,
        );
        cursor = nextCursor;
        keys.push(...foundKeys);
      } while (cursor !== '0');

      if (keys.length === 0) {
        return [];
      }

      const rawValues = await client.mget(keys);
      return rawValues
        .filter((val): val is string => val !== null)
        .map((val): WorkerStatus => JSON.parse(val) as WorkerStatus);
    } catch (err) {
      console.error(
        '[API] Failed to get worker heartbeats from Redis:',
        this.getErrorMessage(err),
      );
      return [];
    }
  }

  /**
   * Performs real-time health checks on PostgreSQL, Redis, and InfluxDB connectivity.
   */
  async getHealthStatus(): Promise<HealthStatus> {
    // 1. PostgreSQL check
    let postgresStatus: 'UP' | 'DOWN' = 'UP';
    let postgresLatency: number | undefined;
    let postgresError: string | undefined;

    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('DataSource is not initialized');
      }
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      postgresLatency = Date.now() - start;
    } catch (err) {
      postgresStatus = 'DOWN';
      postgresError = this.getErrorMessage(err);
    }

    // 2. Redis check
    let redisStatus: 'UP' | 'DOWN' = 'UP';
    let redisLatency: number | undefined;
    let redisError: string | undefined;

    try {
      const start = Date.now();
      const client = (await this.monitoringQueue.client) as unknown as Redis;
      const pong = (await client.ping()) as string;
      if (pong !== 'PONG') {
        throw new Error(`Unexpected Redis response: ${pong}`);
      }
      redisLatency = Date.now() - start;
    } catch (err) {
      redisStatus = 'DOWN';
      redisError = this.getErrorMessage(err);
    }

    // 3. InfluxDB check
    let influxStatus: 'UP' | 'DOWN' = 'UP';
    let influxLatency: number | undefined;
    let influxError: string | undefined;

    try {
      const start = Date.now();
      const influxUrl = this.configService.get<string>(
        'INFLUXDB_URL',
        'http://localhost:8086',
      );
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000); // 3s timeout
      const res = await fetch(`${influxUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(
          `InfluxDB health endpoint returned status ${res.status}`,
        );
      }
      influxLatency = Date.now() - start;
    } catch (err) {
      influxStatus = 'DOWN';
      influxError = this.getErrorMessage(err);
    }

    const overallStatus =
      postgresStatus === 'UP' && redisStatus === 'UP' && influxStatus === 'UP'
        ? 'UP'
        : 'DOWN';

    return {
      status: overallStatus,
      details: {
        postgres: {
          status: postgresStatus,
          latencyMs: postgresLatency,
          error: postgresError,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatency,
          error: redisError,
        },
        influxdb: {
          status: influxStatus,
          latencyMs: influxLatency,
          error: influxError,
        },
      },
    };
  }
}
