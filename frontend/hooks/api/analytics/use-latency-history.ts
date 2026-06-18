import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, LatencyHistoryResponse } from '@/types/features';


export function useLatencyHistory(projectId: string, range?: AnalyticsRange) {
  const [data, setData] = useState<LatencyHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatency = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getLatencyHistory(projectId, range);
      setData(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch latency history';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, range]);

  useEffect(() => {
    fetchLatency();
  }, [fetchLatency]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchLatency,
  };
}
