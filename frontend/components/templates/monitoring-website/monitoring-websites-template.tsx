"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  LatencyCharts,
  DowntimeHistory,
  TimingBreakdown,
  UptimeCharts,
  UptimeHistoryCharts,
  LatencyComparison,
} from "@/components/organisms";


export interface MonitoringWebsitesTemplateProps {
  projectId: string;
  configId?: string;
  className?: string;
}

export function MonitoringWebsitesTemplate({
  projectId,
  configId,
  className,
}: MonitoringWebsitesTemplateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      <LatencyCharts projectId={projectId} configId={configId} />
      <TimingBreakdown projectId={projectId} configId={configId} />
      <UptimeCharts projectId={projectId} configId={configId} />
      <DowntimeHistory projectId={projectId} configId={configId} />
      <UptimeHistoryCharts projectId={projectId} configId={configId} />
      <LatencyComparison projectId={projectId} configId={configId} />
    </div>
  );
}
