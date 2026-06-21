import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailySummary } from '../batch/entities/summary.entity';
import { Project } from '../projects/entities/project.entity';
import { AnalyticsInfluxRepository } from '../analytics/repositories/analytics-influx.repository';
import { TwinStateDto } from './dto/twin-state.dto';
import { RealtimeMetric } from './interfaces/realtime-metric.interface';
import {
  getTodayDateString,
  buildRealtimeMetricsMap,
  mapToTwinObjects,
} from './mappers/digital-twin.mapper';

@Injectable()
export class DigitalTwinService {
  private readonly logger = new Logger(DigitalTwinService.name);

  constructor(
    @InjectRepository(DailySummary)
    private readonly dailySummaryRepo: Repository<DailySummary>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly analyticsInfluxRepo: AnalyticsInfluxRepository,
  ) {}

  async getTwinStateForProject(projectId: string): Promise<TwinStateDto> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: { monitoringConfigs: true },
    });

    if (!project) {
      return new TwinStateDto({
        projectId,
        projectName: 'Unknown',
        twins: [],
        snapshotAt: new Date().toISOString(),
      });
    }

    const [realtimeMap, dailySummaries] = await Promise.all([
      this.getRealtimeMetrics(projectId),
      this.dailySummaryRepo.find({
        where: { projectId, date: getTodayDateString() },
      }),
    ]);

    const twins = mapToTwinObjects(
      project.monitoringConfigs,
      realtimeMap,
      dailySummaries,
    );

    return new TwinStateDto({
      projectId,
      projectName: project.name,
      twins,
      snapshotAt: new Date().toISOString(),
    });
  }

  private async getRealtimeMetrics(
    projectId: string,
  ): Promise<Map<string, RealtimeMetric>> {
    try {
      const rows =
        await this.analyticsInfluxRepo.getRealtimeMetricsForDigitalTwin(
          projectId,
        );
      return buildRealtimeMetricsMap(rows);
    } catch (err) {
      this.logger.warn(
        `[DigitalTwin] Failed to fetch real-time metrics: ${err}`,
      );
      return new Map();
    }
  }
}
