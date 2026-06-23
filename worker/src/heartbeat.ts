import * as os from 'os';
import type { Redis } from 'ioredis';
import { config } from './config.js';

export class WorkerHeartbeat {
  private readonly hostname = os.hostname();
  private readonly pid = process.pid;
  private readonly key = `worker:heartbeat:${this.hostname}:${this.pid}`;
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly redisClient: Redis,
    private readonly getActiveJobsCount: () => number,
  ) {}

  start(): void {
    void this.send();
    this.timer = setInterval(() => void this.send(), config.worker.heartbeatIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async remove(): Promise<void> {
    await this.redisClient.del(this.key);
  }

  private async send(): Promise<void> {
    try {
      await this.redisClient.set(
        this.key,
        JSON.stringify({
          hostname: this.hostname,
          pid: this.pid,
          uptime: Math.round(process.uptime()),
          memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          activeJobs: this.getActiveJobsCount(),
          timestamp: new Date().toISOString(),
        }),
        'EX',
        config.worker.heartbeatTtlSeconds,
      );
    } catch (error) {
      const err = error as Error;
      console.error('[Worker] Failed to send heartbeat to Redis:', err.message);
    }
  }
}
