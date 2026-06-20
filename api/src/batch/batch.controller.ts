import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BatchService } from './batch.service';
import { BatchJobData } from './processors/batch.processor';
import { BatchRunDto } from './dto/batch-run.dto';

@Controller('batch')
export class BatchController {
  constructor(
    private readonly batchService: BatchService,
    @InjectQueue('batch-queue') private readonly batchQueue: Queue,
  ) {}

  @Post('run')
  async triggerManualRun(@Body() body: BatchRunDto) {
    const date = body.date ?? this.getYesterday();

    const job = await this.batchQueue.add(
      'manual-batch',
      { date } satisfies BatchJobData,
      { removeOnComplete: true, removeOnFail: false },
    );

    return {
      message: `Batch pipeline queued for date: ${date}`,
      jobId: job.id,
    };
  }

  @Get('summaries/:projectId')
  getSummaries(
    @Param('projectId') projectId: string,
    @Query('days') days?: string,
  ) {
    return this.batchService.getSummariesByProject(
      projectId,
      days ? Number(days) : 30,
    );
  }

  private getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
}
