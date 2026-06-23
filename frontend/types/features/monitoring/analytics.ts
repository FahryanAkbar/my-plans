export type AnalyticsRange = '1h' | '6h' | '12h' | '24h' | '7d' | '30d';

export interface LatencyDataPoint {
  time: string; // ISO date string from InfluxDB
  latency: number; // response time in milliseconds
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
  uptimePercentage: number; // percentage (0.000 to 100.000)
}

export interface DowntimeEvent {
  configId: string;
  url: string;
  time: string; // ISO date string of the failure event
  latency: number; // response time in milliseconds
  statusCode: number; // HTTP status code (e.g. 500, 502, 0 for timeout)
  errorMessage: string;
}

export interface UptimeTrendPoint {
  time: string; // ISO date string of the window interval
  uptimePercentage: number; // aggregated average uptime percentage
}

export interface UptimeHistoryResponse {
  configId: string;
  url: string;
  series: UptimeTrendPoint[];
}

export interface TimingBreakdownResponse {
  configId: string;
  url: string;
  dns: number; // DNS lookup time (ms)
  tcp: number; // TCP connection time (ms)
  tls: number; // TLS handshake time (ms)
  ttfb: number; // Time to First Byte (ms)
  download: number; // Resource transfer time (ms)
}

export interface NetworkFlowResponse {
  configId: string;
  url: string;
  dnsTime: number;
  tcpTime: number;
  tlsTime: number;
  ttfbTime: number;
  downloadTime: number;
  totalNetworkTime: number;
  bottleneck: 'dnsTime' | 'tcpTime' | 'tlsTime' | 'ttfbTime' | 'downloadTime' | null;
}
