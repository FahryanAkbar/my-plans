import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.repo.find({
      relations: { monitoringConfigs: true },
    });
  }

  async findOneById(id: string): Promise<Project> {
    const project = await this.repo.findOne({
      where: { id },
      relations: { monitoringConfigs: true },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const existing = await this.repo.findOne({ where: { id: dto.id } });
    if (existing) {
      throw new ConflictException(
        `Project with ID ${dto.id} already exists`,
      );
    }
    const project = this.repo.create(dto);
    return this.repo.save(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOneById(id);
    Object.assign(project, dto);
    return this.repo.save(project);
  }

  async remove(id: string): Promise<Project> {
    const project = await this.findOneById(id);
    return this.repo.remove(project);
  }
}
