export interface InfluxPuppeteerRow {
  configId: string;
  url: string;
  networkProfile: string;
  _time: string;
  _field: string;
  _value: string;
}

export interface InfluxBaseRow {
  configId: string;
  _time: string;
  _value: number;
}

export interface LatencyComparisonPoint {
  time: string;
  realLatency: number;
  predictedLatency: number;
}

export interface LatencyComparisonResult {
  configId: string;
  url: string;
  networkProfile: string;
  series: LatencyComparisonPoint[];
}

export interface QosInfluxRow {
  configId: string;
  url: string;
  networkProfile: string;
  latency: number;
  isUp: number;
}

export interface QosProfileMetrics {
  avgLatencyMs: number;
  uptimePercent: number;
  qosScore: number;
}

export interface QosAnalysisResult {
  configId: string;
  url: string;
  profiles: Record<string, QosProfileMetrics>;
  bestProfile: string;
  worstProfile: string;
}
