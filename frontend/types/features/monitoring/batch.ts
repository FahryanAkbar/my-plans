export interface TriggerBatchPayload {
  date?: string;
}

export interface TriggerBatchResponse {
  message: string;
  jobId?: string;
}

export interface DailySummaryResponse {
  id: string;
  projectId: string;
  configId: string;
  url: string;
  date: string;
  avgLatencyMs: number;
  maxLatencyMs: number;
  minLatencyMs: number;
  uptimePercent: number;
  totalChecks: number;
  failedChecks: number;
  downtimeIncidents: number;
  totalDowntimeSeconds: number;
  processedAt: string;
}
