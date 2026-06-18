import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { simulationService } from '@/services';
import { ApiError } from '@/lib';
import { AnalyticsRange, LatencyComparisonResponse } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';

/**
 * Hook for fetching latency comparison metrics (Real vs Predicted Latency).
 * Commonly used for rendering the simulation dual line chart.
 */
export function useLatencyComparison(projectId: string, range?: AnalyticsRange) {
  const [data, setData] = useState<LatencyComparisonResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId) return;
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await simulationService.getLatencyComparison(projectId, range);
      setData(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch latency comparison';
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
  }, [projectId, range]);

  useEffect(() => {
    fetchComparison();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchComparison({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchComparison]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchComparison,
  };
}
