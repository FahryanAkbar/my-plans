import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BatchService } from '../batch.service';

export interface BatchJobData {
  date: string; // Format: YYYY-MM-DD atau 'auto'
}

@Processor('batch-queue')
export class BatchProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchProcessor.name);

  constructor(private readonly batchService: BatchService) {
    super();
  }

  async process(job: Job<BatchJobData>): Promise<void> {
    let { date } = job.data;

    // Jika 'auto', hitung tanggal kemarin secara otomatis (untuk run terjadwal harian)
    if (date === 'auto') {
      const yesterday = new Date(Date.now() - 86400000);
      date = yesterday.toISOString().split('T')[0];
    }

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
