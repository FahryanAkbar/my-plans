import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, NetworkFlowResponse } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';

/**
 * Hook for fetching network flow analysis hops and bottleneck steps.
 */
export function useNetworkFlow(projectId: string, range?: AnalyticsRange, configId?: string) {
  const [data, setData] = useState<NetworkFlowResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlow = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId) return;
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await analyticsService.getNetworkFlow(projectId, range, configId);
      setData(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch network flow analysis';
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
    fetchFlow();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchFlow({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchFlow]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchFlow,
  };
}
