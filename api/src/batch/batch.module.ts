import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { BatchProcessor } from './processors/batch.processor';
import { BatchInfluxRepository } from './repositories/batch-influx.repository';
import { DailySummaryRepository } from './repositories/daily-summary.repository';
import { DailySummary } from './entities/summary.entity';
import { BatchJobData } from './processors/batch.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailySummary]),
    BullModule.registerQueue({ name: 'batch-queue' }),
  ],
  controllers: [BatchController],
  providers: [
    BatchService,
    BatchProcessor,
    BatchInfluxRepository,
    DailySummaryRepository,
  ],
})
export class BatchModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(BatchModule.name);

  constructor(@InjectQueue('batch-queue') private readonly batchQueue: Queue) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const repeatableJobs = await this.batchQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        if (job.name === 'daily-batch') {
          await this.batchQueue.removeRepeatableByKey(job.key);
          this.logger.log(`[Batch] Removed old repeatable job: ${job.key}`);
        }
      }

      await this.batchQueue.add(
        'daily-batch',
        { date: 'auto' } satisfies BatchJobData,
        {
          jobId: 'batch-daily-cron',
          repeat: {
            pattern: '5 0 * * *', // Setiap hari pukul 00:05
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.log(
        '[Batch] Daily cron job registered: runs every day at 00:05',
      );
    } catch (error: unknown) {
      this.logger.error(
        `[Batch] Failed to register daily cron job: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
