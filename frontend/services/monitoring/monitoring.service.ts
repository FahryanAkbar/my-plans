import { API_ENDPOINTS, http } from '@/lib';
import type { ApiMetadata, HealthStatus, WorkerStatus } from '@/types/features';

export const monitoringService = {
  /**
   * Retrieves basic metadata and system uptime of the API Gateway root.
   */
  async getApiMetadata(): Promise<ApiMetadata> {
    const response = await http.get<ApiMetadata>('/');
    return response.data;
  },

  /**
   * Checks the real-time connectivity and latency of PostgreSQL, Redis, and InfluxDB.
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const response = await http.get<HealthStatus>(API_ENDPOINTS.MONITORING.HEALTH);
    return response.data;
  },

  /**
   * Retrieves heartbeats and current system stats of all active background workers.
   */
  async getWorkersStatus(): Promise<WorkerStatus[]> {
    const response = await http.get<WorkerStatus[]>(API_ENDPOINTS.MONITORING.WORKERS);
    return response.data;
  },
};

export type MonitoringService = typeof monitoringService;
