import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, UptimeHistoryResponse } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';

/**
 * Hook for fetching historical uptime percentage trend over time.
 */
export function useUptimeHistory(projectId: string, range?: AnalyticsRange, configId?: string) {
  const [trend, setTrend] = useState<UptimeHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUptimeHistory = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId) return;
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await analyticsService.getUptimeHistory(projectId, range, configId);
      setTrend(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch uptime history';
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
    fetchUptimeHistory();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchUptimeHistory({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchUptimeHistory]);

  return {
    trend,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchUptimeHistory,
  };
}
