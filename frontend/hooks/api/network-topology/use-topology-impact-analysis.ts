import { useState, useCallback } from "react";
import { toast } from "sonner";
import { networkTopologyService } from "@/services";
import { ApiError } from "@/lib";
import { ImpactAnalysisResponse } from "@/types/features";

export function useTopologyImpactAnalysis(projectId: string) {
  const [impactResult, setImpactResult] =
    useState<ImpactAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const simulateImpact = useCallback(
    async (configId: string) => {
      if (!projectId || !configId) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await networkTopologyService.getImpactAnalysis(
          projectId,
          configId,
        );
        setImpactResult(result);
        return result;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to simulate topology impact";
        setError(errMsg);
        toast.error(errMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId],
  );

  const clearSimulation = useCallback(() => {
    setImpactResult(null);
    setError(null);
  }, []);

  return {
    impactResult,
    isLoading,
    error,
    simulateImpact,
    clearSimulation,
  };
}
