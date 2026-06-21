export interface SimulationDataPoint {
  time: string; 
  realLatency: number;
  predictedLatency: number;
}

export interface LatencyComparisonResponse {
  configId: string;
  url: string;
  networkProfile: string; 
  series: SimulationDataPoint[];
}

export interface QosProfileMetrics {
  avgLatencyMs: number;
  uptimePercent: number;
  qosScore: number;
}

export interface QosAnalysisResponse {
  configId: string;
  url: string;
  profiles: Record<string, QosProfileMetrics>;
  bestProfile: string;
  worstProfile: string;
}