import { http, API_ENDPOINTS } from '@/lib';
import type { HealthStatus, WorkerStatus } from '@/types/features';

export const monitoringService = {
  async getHealthStatus(): Promise<HealthStatus> {
    const response = await http.get<HealthStatus>(API_ENDPOINTS.MONITORING.HEALTH);
    return response.data;
  },

  async getWorkersStatus(): Promise<WorkerStatus[]> {
    const response = await http.get<WorkerStatus[]>(API_ENDPOINTS.MONITORING.WORKERS);
    return response.data;
  },
};

export type MonitoringService = typeof monitoringService;
