import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { simulationService } from "@/services";
import { ApiError } from "@/lib";
import { AnalyticsRange, QosAnalysisResponse } from "@/types/features";
import {
  MONITORING_POLL_INTERVAL_MS,
  shouldSkipBackgroundPoll,
} from "../polling";

export function useQosMonitoring(
  projectId: string,
  range?: AnalyticsRange,
  configId?: string,
) {
  const [data, setData] = useState<QosAnalysisResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQos = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!projectId) return;
      const isSilent = options?.silent ?? false;
      if (isSilent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const result = await simulationService.getQosAnalysis(
          projectId,
          range,
          configId,
        );
        setData(result);
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to fetch QoS analysis";
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
    },
    [projectId, range, configId],
  );

  useEffect(() => {
    fetchQos();

    const intervalId = window.setInterval(() => {
      if (!shouldSkipBackgroundPoll()) {
        fetchQos({ silent: true });
      }
    }, MONITORING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchQos]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchQos,
  };
}
