import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { batchService } from '@/services';
import type { ApiError } from '@/lib';
import type {
  DailySummaryResponse,
  TriggerBatchPayload,
} from '@/types/features';

export function useBatch(projectId?: string, days?: number) {
  const [summaries, setSummaries] = useState<DailySummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const fetchSummaries = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await batchService.getDailySummaries(projectId, days);
      setSummaries(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch daily summaries';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, days]);

  const triggerBatch = useCallback(async (payload?: TriggerBatchPayload) => {
    setIsTriggering(true);
    try {
      const result = await batchService.triggerBatch(payload);
      toast.success(result.message || 'Batch run triggered successfully');
      return result;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to trigger batch run';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsTriggering(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchSummaries();
    }
  }, [projectId, fetchSummaries]);

  return {
    summaries,
    isLoading,
    error,
    isTriggering,
    refetch: fetchSummaries,
    triggerBatch,
  };
}
