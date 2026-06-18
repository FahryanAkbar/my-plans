import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { WorkerStatus } from '../entities/worker-status.entity';
import { MonitoringRedisKeyPattern } from '../enums/monitoring-key.enum';
import { getErrorMessage } from '../utils/error-message.util';

@Injectable()
export class WorkerHeartbeatRepository {
  constructor(
    @InjectQueue('monitoring-queue')
    private readonly monitoringQueue: Queue,
  ) {}

  async getActiveWorkers(): Promise<WorkerStatus[]> {
    const client = await this.getRedisClient();

    try {
      const keys = await this.scanHeartbeatKeys(client);
      if (keys.length === 0) {
        return [];
      }

      const rawValues = await client.mget(keys);
      return rawValues
        .filter((value): value is string => value !== null)
        .map((value) => JSON.parse(value) as WorkerStatus);
    } catch (error) {
      console.error(
        '[API] Failed to get worker heartbeats from Redis:',
        getErrorMessage(error),
      );
      return [];
    }
  }

  async ping(): Promise<string> {
    const client = await this.getRedisClient();
    return client.ping();
  }

  private async getRedisClient(): Promise<Redis> {
    return (await this.monitoringQueue.client) as unknown as Redis;
  }

  private async scanHeartbeatKeys(client: Redis): Promise<string[]> {
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [nextCursor, foundKeys] = await client.scan(
        cursor,
        'MATCH',
        MonitoringRedisKeyPattern.WORKER_HEARTBEAT,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    return keys;
  }
}
