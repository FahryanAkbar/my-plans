// --- Monitoring System Types (Health & Workers) ---

export interface ApiMetadata {
  name: string;
  version: string;
  status: string;
  uptime: number; // in seconds
  timestamp: string; // ISO date string
}

export interface DatabaseHealth {
  status: 'UP' | 'DOWN';
  latencyMs?: number;
  error?: string;
}

export interface HealthStatus {
  status: 'UP' | 'DOWN';
  details: {
    postgres: DatabaseHealth;
    redis: DatabaseHealth;
    influxdb: DatabaseHealth;
  };
}

export interface WorkerStatus {
  hostname: string;
  pid: number;
  uptime: number; // in seconds
  memory: number; // in MB
  activeJobs: number;
  timestamp: string; // ISO date string
}
