import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailySummary } from '../entities/summary.entity';

export type CreateSummaryDto = Omit<
  DailySummary,
  'id' | 'processedAt' | 'project' | 'config'
>;

@Injectable()
export class DailySummaryRepository {
  constructor(
    @InjectRepository(DailySummary)
    private readonly repo: Repository<DailySummary>,
  ) {}

  async upsert(summaries: CreateSummaryDto[]): Promise<void> {
    if (summaries.length === 0) return;

    await this.repo
      .createQueryBuilder()
      .insert()
      .into(DailySummary)
      .values(summaries)
      .orUpdate(
        [
          'url',
          'avgLatencyMs',
          'maxLatencyMs',
          'minLatencyMs',
          'uptimePercent',
          'totalChecks',
          'failedChecks',
          'downtimeIncidents',
          'totalDowntimeSeconds',
        ],
        ['projectId', 'configId', 'date'],
      )
      .execute();
  }

  findByProjectAndDateRange(
    projectId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailySummary[]> {
    return this.repo
      .createQueryBuilder('s')
      .where('s.projectId = :projectId', { projectId })
      .andWhere('s.date >= :startDate', { startDate })
      .andWhere('s.date <= :endDate', { endDate })
      .orderBy('s.date', 'ASC')
      .getMany();
  }

  findLatestByProject(projectId: string, limit = 30): Promise<DailySummary[]> {
    return this.repo
      .createQueryBuilder('s')
      .where('s.projectId = :projectId', { projectId })
      .orderBy('s.date', 'DESC')
      .limit(limit)
      .getMany();
  }
}
