import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  DependencyHealthStatus,
  HealthStatus,
} from '../entities/health-status.entity';
import { HealthStatusValue } from '../enums/health-status.enum';
import { WorkerHeartbeatRepository } from '../repositories/worker-heartbeat.repository';
import { getErrorMessage } from '../utils/error-message.util';

@Injectable()
export class DependencyHealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly workerHeartbeatRepository: WorkerHeartbeatRepository,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const [postgres, redis, influxdb] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkInfluxDb(),
    ]);

    const status =
      postgres.status === HealthStatusValue.UP &&
      redis.status === HealthStatusValue.UP &&
      influxdb.status === HealthStatusValue.UP
        ? HealthStatusValue.UP
        : HealthStatusValue.DOWN;

    return {
      status,
      details: {
        postgres,
        redis,
        influxdb,
      },
    };
  }

  private async checkPostgres(): Promise<DependencyHealthStatus> {
    return this.measureDependency(async () => {
      if (!this.dataSource.isInitialized) {
        throw new Error('DataSource is not initialized');
      }

      await this.dataSource.query('SELECT 1');
    });
  }

  private async checkRedis(): Promise<DependencyHealthStatus> {
    return this.measureDependency(async () => {
      const pong = await this.workerHeartbeatRepository.ping();
      if (pong !== 'PONG') {
        throw new Error(`Unexpected Redis response: ${pong}`);
      }
    });
  }

  private async checkInfluxDb(): Promise<DependencyHealthStatus> {
    return this.measureDependency(async () => {
      const influxUrl = this.configService.get<string>(
        'INFLUXDB_URL',
        'http://localhost:8086',
      );
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`${influxUrl}/health`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `InfluxDB health endpoint returned status ${response.status}`,
          );
        }
      } finally {
        clearTimeout(timer);
      }
    });
  }

  private async measureDependency(
    check: () => Promise<void>,
  ): Promise<DependencyHealthStatus> {
    const start = Date.now();

    try {
      await check();
      return {
        status: HealthStatusValue.UP,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: HealthStatusValue.DOWN,
        error: getErrorMessage(error),
      };
    }
  }
}
