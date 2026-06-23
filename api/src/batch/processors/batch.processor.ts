import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BatchService } from '../batch.service';

export interface BatchJobData {
  date: string;
}

@Processor('batch-queue')
export class BatchProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchProcessor.name);

  constructor(private readonly batchService: BatchService) {
    super();
  }

  async process(job: Job<BatchJobData>): Promise<void> {
    const { date } = job.data;
    this.logger.log(`[Batch] Processing job ${job.id} for date: ${date}`);
    await this.batchService.runPipelineForDate(date);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`[Batch] Job ${job.id} completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(`[Batch] Job ${job?.id} failed: ${error.message}`);
  }
}
