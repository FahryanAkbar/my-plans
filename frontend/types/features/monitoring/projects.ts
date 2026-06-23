import { 
  Environment, 
  NetworkProfile, 
  Engine 
} from '@/lib'

export interface Project {
  id: string; 
  name: string;
  monitoringConfigs?: MonitoringConfig[];
  createdAt: string; 
  updatedAt: string; 
}

export interface MonitoringConfig {
  id: string;
  projectId: string;
  project?: Project;
  name: string;
  url: string;
  environment: Environment;
  interval: number;
  networkProfile: NetworkProfile;
  engine: Engine;
  timeout: number;
  expectedStatus: number; 
  checkSsl: boolean;
  enabled: boolean;
  isArchived: boolean;
  lastCheckedAt?: string; 
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}


export interface CreateProjectRequest {
  id: string; 
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export interface CreateMonitoringConfigRequest {
  name: string;
  url: string; 
  environment?: Environment; 
  interval?: number; 
  networkProfile?: NetworkProfile; 
  engine?: Engine;
  timeout?: number;
  expectedStatus?: number;
  checkSsl?: boolean;
  enabled?: boolean;
  createdBy?: string;
}

export interface UpdateMonitoringConfigRequest {
  name?: string;
  url?: string;
  environment?: Environment;
  interval?: number;
  networkProfile?: NetworkProfile;
  engine?: Engine;
  timeout?: number;
  expectedStatus?: number;
  checkSsl?: boolean;
  enabled?: boolean;
  createdBy?: string;
}
