import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { monitoringService } from '@/services';
import type { ApiError } from '@/lib';
import type { HealthStatus } from '@/types/features';
import { MONITORING_POLL_INTERVAL_MS, shouldSkipBackgroundPoll } from '../polling';

/**
 * Hook for checking real-time system health (Postgres, Redis, InfluxDB).
 */
export function useSystemHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await monitoringService.getHealthStatus();
      setHealth(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch system health status';
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
  }, []);

  useEffect(() => {
    fetchHealth();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchHealth({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchHealth]);

  return {
    health,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchHealth,
  };
}
