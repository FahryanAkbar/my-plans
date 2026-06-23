import { Injectable } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { MonitoringConfig } from './entities/monitoring-config.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateMonitoringConfigDto } from './dto/create-monitoring-config.dto';
import { UpdateMonitoringConfigDto } from './dto/update-monitoring-config.dto';
import { ProjectRepository } from './repositories/project.repository';
import { MonitoringConfigRepository } from './repositories/monitoring-config.repository';
import { QueueJobRepository } from './repositories/queue-job.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly monitoringConfigRepository: MonitoringConfigRepository,
    private readonly queueJobRepository: QueueJobRepository,
  ) {}

  // --- PROJECT CRUD ---

  createProject(dto: CreateProjectDto): Promise<Project> {
    return this.projectRepository.create(dto);
  }

  findAllProjects(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  findOneProject(id: string): Promise<Project> {
    return this.projectRepository.findOneById(id);
  }

  updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    return this.projectRepository.update(id, dto);
  }

  async removeProject(id: string): Promise<void> {
    const project = await this.projectRepository.findOneById(id);

    if (project.monitoringConfigs?.length > 0) {
      for (const config of project.monitoringConfigs) {
        await this.queueJobRepository.remove(config.id);
      }
    }

    await this.projectRepository.remove(id);
  }

  // --- MONITORING CONFIG CRUD ---

  async createConfig(
    projectId: string,
    dto: CreateMonitoringConfigDto,
  ): Promise<MonitoringConfig> {
    await this.projectRepository.findOneById(projectId);

    const savedConfig = await this.monitoringConfigRepository.create(
      dto,
      projectId,
    );

    if (savedConfig.enabled && !savedConfig.isArchived) {
      await this.queueJobRepository.add(savedConfig);
    }

    return savedConfig;
  }

  async findConfigsByProject(projectId: string): Promise<MonitoringConfig[]> {
    await this.projectRepository.findOneById(projectId);
    return this.monitoringConfigRepository.findByProject(projectId);
  }

  findOneConfig(
    projectId: string,
    configId: string,
  ): Promise<MonitoringConfig> {
    return this.monitoringConfigRepository.findOne(projectId, configId);
  }

  async updateConfig(
    projectId: string,
    configId: string,
    dto: UpdateMonitoringConfigDto,
  ): Promise<MonitoringConfig> {
    const savedConfig = await this.monitoringConfigRepository.update(
      projectId,
      configId,
      dto,
    );

    if (savedConfig.enabled && !savedConfig.isArchived) {
      await this.queueJobRepository.add(savedConfig);
    } else {
      await this.queueJobRepository.remove(savedConfig.id);
    }

    return savedConfig;
  }

  async removeConfig(projectId: string, configId: string): Promise<void> {
    const config = await this.monitoringConfigRepository.remove(
      projectId,
      configId,
    );
    await this.queueJobRepository.remove(config.id);
  }
}
