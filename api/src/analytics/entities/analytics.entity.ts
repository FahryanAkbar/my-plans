import { AnalyticsField } from '../enums/analytics-field.enum';

export interface LatencyHistoryPoint {
  time: string;
  latency: number;
  status: string;
}

export interface LatencyHistory {
  configId: string;
  url: string;
  series: LatencyHistoryPoint[];
}

export interface UptimeStats {
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

export interface UptimeHistoryPoint {
  time: string;
  uptimePercentage: number;
}

export interface UptimeHistory {
  configId: string;
  url: string;
  series: UptimeHistoryPoint[];
}

export interface TimingBreakdown {
  configId: string;
  url: string;
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  download: number;
}

export interface LatencyHistoryRow {
  configId: string;
  url: string;
  _time: string;
  _value: number;
  status: string;
}

export interface UptimeStatsRow {
  configId: string;
  url: string;
  _value: boolean | string;
}

export interface DowntimeHistoryRow {
  configId: string;
  url: string;
  _time: string;
  _field: AnalyticsField;
  _value: number | string;
}

export interface UptimeHistoryRow {
  configId: string;
  url: string;
  _time: string;
  _value: number;
}

export interface TimingBreakdownRow {
  configId: string;
  url: string;
  _field: AnalyticsField;
  _value: number;
}
