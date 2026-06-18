import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { analyticsService } from '@/services';
import type { ApiError } from '@/lib';
import type { AnalyticsRange, UptimeStatsResponse } from '@/types/features';


export function useUptimeStats(projectId: string, range?: AnalyticsRange) {
  const [stats, setStats] = useState<UptimeStatsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getUptimeStats(projectId, range);
      setStats(result);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch uptime stats';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
