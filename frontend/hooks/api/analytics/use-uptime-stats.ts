import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, UptimeStatsResponse } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';


export function useUptimeStats(projectId: string, range?: AnalyticsRange, configId?: string) {
  const [stats, setStats] = useState<UptimeStatsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId) return;
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await analyticsService.getUptimeStats(projectId, range, configId);
      setStats(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch uptime stats';
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
    fetchStats();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchStats({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchStats,
  };
}
