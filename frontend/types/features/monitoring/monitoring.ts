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
  uptime: number;
  memory: number;
  activeJobs: number;
  timestamp: string;
}


export type AnalyticsRange = '1h' | '6h' | '12h' | '24h' | '7d' | '30d';

export interface LatencyDataPoint {
  time: string; 
  latency: number; 
  status: 'success' | 'failed';
}

export interface LatencyHistoryResponse {
  configId: string;
  url: string;
  series: LatencyDataPoint[];
}

export interface UptimeStatsResponse {
  configId: string;
  url: string;
  totalChecks: number;
  successCount: number;
  failCount: number;
  uptimePercentage: number; 
}

export interface DowntimeEvent {
  configId: string;
  url: string;
  time: string; 
  latency: number;
  statusCode: number;
  errorMessage: string;
}

export interface UptimeTrendPoint {
  time: string;
  uptimePercentage: number; 
}

export interface UptimeHistoryResponse {
  configId: string;
  url: string;
  series: UptimeTrendPoint[];
}

export interface TimingBreakdownResponse {
  configId: string;
  url: string;
  dns: number; // in milliseconds
  tcp: number; // in milliseconds
  tls: number; // in milliseconds
  ttfb: number; // in milliseconds
  download: number; // in milliseconds
}

// --- Simulation Types ---

export interface SimulationDataPoint {
  time: string; // ISO date string
  realLatency: number; // actual response time
  predictedLatency: number; // calculated latency using transmission model
}

export interface LatencyComparisonResponse {
  configId: string;
  url: string;
  networkProfile: string; // e.g. 'NETWORK_3G'
  series: SimulationDataPoint[];
}
