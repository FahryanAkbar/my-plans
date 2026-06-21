import { http, API_ENDPOINTS, getProjectEndpoints } from '@/lib';
import type {
  TriggerBatchPayload,
  TriggerBatchResponse,
  DailySummaryResponse,
} from '@/types/features';

export const batchService = {
  async triggerBatch(payload?: TriggerBatchPayload): Promise<TriggerBatchResponse> {
    const response = await http.post<TriggerBatchResponse>(
      API_ENDPOINTS.BATCH.RUN,
      payload ?? {}
    );
    return response.data;
  },

  async getDailySummaries(projectId: string, days?: number): Promise<DailySummaryResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<DailySummaryResponse[]>(
      projectApi.BATCH.SUMMARIES,
      { params: { days } }
    );
    return response.data;
  },
};

export type BatchService = typeof batchService;
