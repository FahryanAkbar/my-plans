import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { BatchInfluxRepository } from './repositories/batch-influx.repository';
import { DailySummaryRepository } from './repositories/daily-summary.repository';
import { DailySummary } from './entities/summary.entity';
import { Project } from '../projects/entities/project.entity';
import { MonitoringConfig } from '../projects/entities/monitoring-config.entity';
import { mapRawRowsToSummaries } from './mappers/batch.mapper';
import { BatchJobData } from './processors/batch.processor';

@Injectable()
export class BatchService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BatchService.name);

  private static readonly DAILY_BATCH_JOB_NAME = 'daily-batch';
  private static readonly DAILY_BATCH_CRON_PATTERN = '5 0 * * *';
  private static readonly MANUAL_BATCH_JOB_NAME = 'manual-batch';

  constructor(
    private readonly batchInfluxRepository: BatchInfluxRepository,
    private readonly dailySummaryRepository: DailySummaryRepository,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(MonitoringConfig)
    private readonly configRepository: Repository<MonitoringConfig>,
    @InjectQueue('batch-queue') private readonly batchQueue: Queue,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      // Bersihkan repeatable job lama agar tidak duplikat saat restart
      const repeatableJobs = await this.batchQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        if (job.name === BatchService.DAILY_BATCH_JOB_NAME) {
          await this.batchQueue.removeRepeatableByKey(job.key);
          this.logger.log(`[Batch] Removed old repeatable job: ${job.key}`);
        }
      }

      await this.batchQueue.add(
        BatchService.DAILY_BATCH_JOB_NAME,
        { date: 'auto' } satisfies BatchJobData,
        {
          jobId: 'batch-daily-cron',
          repeat: {
            pattern: BatchService.DAILY_BATCH_CRON_PATTERN,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.log(
        `[Batch] Daily cron job registered: runs every day at ${BatchService.DAILY_BATCH_CRON_PATTERN}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Batch] Failed to register daily cron job: ${errorMessage}`,
      );
    }
  }

  async runPipelineForDate(
    dateStr: string,
  ): Promise<{ processed: number; date: string }> {
    const targetDate = dateStr === 'auto' ? this.getYesterday() : dateStr;

    this.logger.log(`[Batch] Starting ETL pipeline for date: ${targetDate}`);

    try {
      const rawRows =
        await this.batchInfluxRepository.getRawMetricsForDate(targetDate);
      this.logger.log(
        `[Batch] Extracted ${rawRows.length} raw rows from InfluxDB`,
      );

      if (rawRows.length === 0) {
        this.logger.warn(`[Batch] No data found for date: ${targetDate}`);
        return { processed: 0, date: targetDate };
      }

      const existingProjects = await this.projectRepository.find({
        select: { id: true },
      });
      const existingConfigs = await this.configRepository.find({
        select: { id: true },
      });

      const activeProjectIds = new Set(existingProjects.map((p) => p.id));
      const activeConfigIds = new Set(existingConfigs.map((c) => c.id));

      const summaries = mapRawRowsToSummaries(rawRows, targetDate);

      const activeSummaries = summaries.filter(
        (s) =>
          activeProjectIds.has(s.projectId) && activeConfigIds.has(s.configId),
      );

      this.logger.log(
        `[Batch] Transformed into ${summaries.length} summary records (Active: ${activeSummaries.length})`,
      );

      if (activeSummaries.length === 0) {
        this.logger.warn(
          `[Batch] No active summary records to save for date: ${targetDate}`,
        );
        return { processed: 0, date: targetDate };
      }

      await this.dailySummaryRepository.upsert(activeSummaries);
      this.logger.log(
        `[Batch] Loaded ${activeSummaries.length} summaries into PostgreSQL`,
      );

      return { processed: activeSummaries.length, date: targetDate };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `[Batch] Failed to run ETL pipeline for date ${targetDate}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async queueManualBatch(
    date?: string,
  ): Promise<{ message: string; jobId?: string }> {
    const targetDate = date ?? this.getYesterday();

    const job = await this.batchQueue.add(
      BatchService.MANUAL_BATCH_JOB_NAME,
      { date: targetDate } satisfies BatchJobData,
      { removeOnComplete: true, removeOnFail: false },
    );

    return {
      message: `Batch pipeline queued for date: ${targetDate}`,
      jobId: job.id,
    };
  }

  async getSummariesByProject(
    projectId: string,
    days = 30,
  ): Promise<DailySummary[]> {
    return this.dailySummaryRepository.findLatestByProject(projectId, days);
  }

  private getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
}
