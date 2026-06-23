import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, DowntimeEvent } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';

/**
 * Hook for fetching recent downtime and failure incidents log.
 */
export function useDowntimeHistory(projectId: string, range?: AnalyticsRange, configId?: string) {
  const [events, setEvents] = useState<DowntimeEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDowntime = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId) return;
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await analyticsService.getDowntimeHistory(projectId, range, configId);
      setEvents(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch downtime history';
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
    fetchDowntime();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchDowntime({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchDowntime]);

  return {
    events,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchDowntime,
  };
}
