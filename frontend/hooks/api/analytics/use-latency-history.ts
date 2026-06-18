import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, LatencyHistoryResponse } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';


export function useLatencyHistory(projectId: string, range?: AnalyticsRange, configId?: string) {
  const [data, setData] = useState<LatencyHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatency = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId) return;
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await analyticsService.getLatencyHistory(projectId, range, configId);
      setData(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch latency history';
      setError(errMsg);
      if (!isSilent) {
        toast.error(errMsg);
      }
    } finally {
      if (isSilent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [projectId, range, configId]);

  useEffect(() => {
    fetchLatency();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchLatency({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchLatency]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchLatency,
  };
}
