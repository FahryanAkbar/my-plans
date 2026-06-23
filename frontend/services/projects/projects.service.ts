import { http ,API_ENDPOINTS, getProjectEndpoints } from '@/lib';
import type {
  Project,
  MonitoringConfig,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateMonitoringConfigRequest,
  UpdateMonitoringConfigRequest,
} from '@/types/features';

export const projectsService = {

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await http.post<Project>(API_ENDPOINTS.PROJECTS.ROOT, data);
    return response.data;
  },

  async findAllProjects(): Promise<Project[]> {
    const response = await http.get<Project[]>(API_ENDPOINTS.PROJECTS.ROOT);
    return response.data;
  },

  async findOneProject(id: string): Promise<Project> {
    const projectApi = getProjectEndpoints(id);
    const response = await http.get<Project>(projectApi.DETAIL);
    return response.data;
  },

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const projectApi = getProjectEndpoints(id);
    const response = await http.patch<Project>(projectApi.DETAIL, data);
    return response.data;
  },

  async removeProject(id: string): Promise<void> {
    const projectApi = getProjectEndpoints(id);
    await http.delete(projectApi.DETAIL);
  },

  async createConfig(
    projectId: string,
    data: CreateMonitoringConfigRequest,
  ): Promise<MonitoringConfig> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.post<MonitoringConfig>(
      projectApi.MONITORING.ROOT,
      data,
    );
    return response.data;
  },

  async findConfigsByProject(projectId: string): Promise<MonitoringConfig[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<MonitoringConfig[]>(
      projectApi.MONITORING.ROOT,
    );
    return response.data;
  },

  async findOneConfig(
    projectId: string,
    configId: string,
  ): Promise<MonitoringConfig> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<MonitoringConfig>(
      projectApi.MONITORING.DETAIL(configId),
    );
    return response.data;
  },

  async updateConfig(
    projectId: string,
    configId: string,
    data: UpdateMonitoringConfigRequest,
  ): Promise<MonitoringConfig> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.patch<MonitoringConfig>(
      projectApi.MONITORING.DETAIL(configId),
      data,
    );
    return response.data;
  },

  async removeConfig(projectId: string, configId: string): Promise<void> {
    const projectApi = getProjectEndpoints(projectId);
    await http.delete(projectApi.MONITORING.DETAIL(configId));
  },
};

export type ProjectsService = typeof projectsService;