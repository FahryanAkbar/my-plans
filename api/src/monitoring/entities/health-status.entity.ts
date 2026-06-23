import { HealthStatusValue } from '../enums/health-status.enum';

export interface DependencyHealthStatus {
  status: HealthStatusValue;
  latencyMs?: number;
  error?: string;
}

export interface HealthStatus {
  status: HealthStatusValue;
  details: {
    postgres: DependencyHealthStatus;
    redis: DependencyHealthStatus;
    influxdb: DependencyHealthStatus;
  };
}
