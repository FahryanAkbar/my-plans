import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { MonitoringConfig } from './entities/monitoring-config.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateMonitoringConfigDto } from './dto/create-monitoring-config.dto';
import { UpdateMonitoringConfigDto } from './dto/update-monitoring-config.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(MonitoringConfig)
    private readonly configRepository: Repository<MonitoringConfig>,
  ) {}

  // --- PROJECT CRUD ---

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const existing = await this.projectRepository.findOne({
      where: { id: createProjectDto.id },
    });
    if (existing) {
      throw new ConflictException(
        `Project with ID ${createProjectDto.id} already exists`,
      );
    }
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAllProjects(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: { monitoringConfigs: true },
    });
  }

  async findOneProject(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: { monitoringConfigs: true },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOneProject(id);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async removeProject(id: string): Promise<void> {
    const project = await this.findOneProject(id);
    await this.projectRepository.remove(project);
  }

  // --- MONITORING CONFIG CRUD ---

  async createConfig(
    projectId: string,
    dto: CreateMonitoringConfigDto,
  ): Promise<MonitoringConfig> {
    // Ensure project exists first
    await this.findOneProject(projectId);

    const config = this.configRepository.create({
      ...dto,
      projectId,
    });
    return this.configRepository.save(config);
  }

  async findConfigsByProject(projectId: string): Promise<MonitoringConfig[]> {
    await this.findOneProject(projectId);
    return this.configRepository.find({
      where: { projectId, isArchived: false },
    });
  }

  async findOneConfig(
    projectId: string,
    configId: string,
  ): Promise<MonitoringConfig> {
    const config = await this.configRepository.findOne({
      where: { id: configId, projectId },
    });
    if (!config) {
      throw new NotFoundException(
        `Monitoring config with ID ${configId} not found under project ${projectId}`,
      );
    }
    return config;
  }

  async updateConfig(
    projectId: string,
    configId: string,
    dto: UpdateMonitoringConfigDto,
  ): Promise<MonitoringConfig> {
    const config = await this.findOneConfig(projectId, configId);
    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  async removeConfig(projectId: string, configId: string): Promise<void> {
    const config = await this.findOneConfig(projectId, configId);
    // Soft delete / archive
    config.isArchived = true;
    config.enabled = false;
    await this.configRepository.save(config);
  }
}
