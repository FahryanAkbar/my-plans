import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchRunDto } from './dto/batch-run.dto';
import { BatchSummariesQueryDto } from './dto/batch-summaries-query.dto';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('run')
  triggerManualRun(@Body() body: BatchRunDto) {
    return this.batchService.queueManualBatch(body.date);
  }

  @Get('summaries/:projectId')
  getSummaries(
    @Param('projectId') projectId: string,
    @Query() query: BatchSummariesQueryDto,
  ) {
    return this.batchService.getSummariesByProject(projectId, query.days);
  }
}
