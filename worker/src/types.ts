export type Engine = 'HTTP' | 'PUPPETEER' | string;

export type NetworkProfile = 'WIFI' | 'NETWORK_4G' | 'NETWORK_3G' | 'FAST_3G' | string;

export interface MonitoringJobData {
  configId: string;
  projectId: string;
  url: string;
  timeout?: number;
  expectedStatus?: number;
  checkSsl?: boolean;
  engine?: Engine;
  networkProfile?: NetworkProfile;
}

export interface NavigationTimings {
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  download: number;
}

export interface PingResult {
  isUp: boolean;
  latency: number;
  statusCode: number;
  errorMessage?: string;
  timings?: NavigationTimings | null;
  pageSize?: number;
}

export interface SslCheckResult {
  valid: boolean;
  daysRemaining?: number;
  error?: string;
}

export interface MonitoringResult {
  isUp: boolean;
  errorMessage?: string;
  ping: PingResult;
  ssl: SslCheckResult;
}
