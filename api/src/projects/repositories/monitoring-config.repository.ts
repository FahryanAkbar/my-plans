import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringConfig } from '../entities/monitoring-config.entity';
import { CreateMonitoringConfigDto } from '../dto/create-monitoring-config.dto';
import { UpdateMonitoringConfigDto } from '../dto/update-monitoring-config.dto';

@Injectable()
export class MonitoringConfigRepository {
  constructor(
    @InjectRepository(MonitoringConfig)
    private readonly repo: Repository<MonitoringConfig>,
  ) {}

  findAllActive(): Promise<MonitoringConfig[]> {
    return this.repo.find({
      where: { enabled: true, isArchived: false },
    });
  }

  findByProject(projectId: string): Promise<MonitoringConfig[]> {
    return this.repo.find({
      where: { projectId, isArchived: false },
    });
  }

  async findOne(projectId: string, configId: string): Promise<MonitoringConfig> {
    const config = await this.repo.findOne({
      where: { id: configId, projectId },
    });
    if (!config) {
      throw new NotFoundException(
        `Monitoring config with ID ${configId} not found under project ${projectId}`,
      );
    }
    return config;
  }

  async create(
    dto: CreateMonitoringConfigDto,
    projectId: string,
  ): Promise<MonitoringConfig> {
    const config = this.repo.create({ ...dto, projectId });
    return this.repo.save(config);
  }

  async update(
    projectId: string,
    configId: string,
    dto: UpdateMonitoringConfigDto,
  ): Promise<MonitoringConfig> {
    const config = await this.findOne(projectId, configId);
    Object.assign(config, dto);
    return this.repo.save(config);
  }

  async remove(projectId: string, configId: string): Promise<MonitoringConfig> {
    const config = await this.findOne(projectId, configId);
    return this.repo.remove(config);
  }
}
