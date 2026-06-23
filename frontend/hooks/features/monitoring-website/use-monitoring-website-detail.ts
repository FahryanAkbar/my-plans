import * as React from "react";
import { useProjectConfigs } from "@/hooks";
import type { AnalyticsRange } from "@/types/features";

export function useMonitoringWebsiteDetail(projectId: string, configId?: string) {
  const [range, setRange] = React.useState<AnalyticsRange>("24h");
  const { configs, isLoading } = useProjectConfigs(projectId);

  const activeConfig = React.useMemo(() => {
    if (!configs || configs.length === 0) return null;
    return configId ? configs.find((c) => c.id === configId) : configs[0];
  }, [configs, configId]);

  return {
    range,
    setRange,
    configs,
    isLoading,
    activeConfig,
  };
}
