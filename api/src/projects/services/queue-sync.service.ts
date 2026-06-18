import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MonitoringConfigRepository } from '../repositories/monitoring-config.repository';
import { QueueJobRepository } from '../repositories/queue-job.repository';

@Injectable()
export class QueueSyncService implements OnApplicationBootstrap {
  constructor(
    private readonly monitoringConfigRepository: MonitoringConfigRepository,
    private readonly queueJobRepository: QueueJobRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    console.log('[API] Syncing active monitoring configs with Redis Queue...');

    const activeConfigs = await this.monitoringConfigRepository.findAllActive();

    console.log(
      `[API] Found ${activeConfigs.length} active configs to register.`,
    );

    for (const config of activeConfigs) {
      await this.queueJobRepository.add(config);
      console.log(`[API] Registered repeatable job for URL: ${config.url}`);
    }

    console.log('[API] Redis Queue synchronization complete.');
  }
}
