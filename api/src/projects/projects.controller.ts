import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateMonitoringConfigDto } from './dto/create-monitoring-config.dto';
import { UpdateMonitoringConfigDto } from './dto/update-monitoring-config.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  findAllProjects() {
    return this.projectsService.findAllProjects();
  }

  @Get(':id')
  findOneProject(@Param('id') id: string) {
    return this.projectsService.findOneProject(id);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProject(@Param('id') id: string) {
    return this.projectsService.removeProject(id);
  }

  @Post(':projectId/monitoring')
  createConfig(
    @Param('projectId') projectId: string,
    @Body() createMonitoringConfigDto: CreateMonitoringConfigDto,
  ) {
    return this.projectsService.createConfig(
      projectId,
      createMonitoringConfigDto,
    );
  }

  @Get(':projectId/monitoring')
  findConfigsByProject(@Param('projectId') projectId: string) {
    return this.projectsService.findConfigsByProject(projectId);
  }

  @Get(':projectId/monitoring/:configId')
  findOneConfig(
    @Param('projectId') projectId: string,
    @Param('configId') configId: string,
  ) {
    return this.projectsService.findOneConfig(projectId, configId);
  }

  @Patch(':projectId/monitoring/:configId')
  updateConfig(
    @Param('projectId') projectId: string,
    @Param('configId') configId: string,
    @Body() updateMonitoringConfigDto: UpdateMonitoringConfigDto,
  ) {
    return this.projectsService.updateConfig(
      projectId,
      configId,
      updateMonitoringConfigDto,
    );
  }

  @Delete(':projectId/monitoring/:configId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeConfig(
    @Param('projectId') projectId: string,
    @Param('configId') configId: string,
  ) {
    return this.projectsService.removeConfig(projectId, configId);
  }
}
