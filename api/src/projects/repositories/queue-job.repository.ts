import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MonitoringConfig } from '../entities/monitoring-config.entity';

@Injectable()
export class QueueJobRepository {
  constructor(
    @InjectQueue('monitoring-queue')
    private readonly monitoringQueue: Queue,
  ) {}

  async add(config: MonitoringConfig): Promise<void> {
    // Ensure any previous job configuration for this config is removed first
    await this.remove(config.id);

    await this.monitoringQueue.add(
      'ping-job',
      {
        configId: config.id,
        projectId: config.projectId,
        url: config.url,
        timeout: config.timeout,
        expectedStatus: config.expectedStatus,
        checkSsl: config.checkSsl,
        engine: config.engine,
        networkProfile: config.networkProfile,
      },
      {
        jobId: config.id,
        repeat: {
          every: config.interval,
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async remove(configId: string): Promise<void> {
    const repeatableJobs = await this.monitoringQueue.getRepeatableJobs();
    const client = await this.monitoringQueue.client;

    for (const job of repeatableJobs) {
      const rawData = await client.hget(
        `bull:${this.monitoringQueue.name}:repeat:${job.key}`,
        'data',
      );
      if (!rawData) continue;

      try {
        const parsed = JSON.parse(rawData) as Record<string, unknown>;
        if (parsed && parsed.configId === configId) {
          await this.monitoringQueue.removeRepeatableByKey(job.key);
          console.log(
            `[API] Successfully removed stale repeatable job key: ${job.key} for config ${configId}`,
          );
        }
      } catch (err) {
        console.error(
          `[API] Error parsing repeatable job data for config ${configId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }
}
