export type TwinStatus = 'up' | 'down' | 'degraded' | 'unknown';

export type TwinTrend = 'stable' | 'degrading' | 'recovering';

export interface TwinObject {
  configId: string;
  projectId: string;
  url: string;
  name: string;
  status: TwinStatus;
  latencyMs: number;
  lastCheckedAt: string;
  uptimePercent: number;
  avgLatencyMs: number;
  downtimeIncidents: number;
  twinHealth: number;
  trend: TwinTrend;
}

export interface TwinStateDto {
  projectId: string;
  projectName: string;
  twins: TwinObject[];
  snapshotAt: string;
}

export interface SubscribeProjectPayload {
  projectId: string;
}
