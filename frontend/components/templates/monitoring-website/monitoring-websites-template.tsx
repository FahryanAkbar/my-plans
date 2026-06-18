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
  className?: string;
}

export function MonitoringWebsitesTemplate({
  projectId,
  className,
}: MonitoringWebsitesTemplateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      <LatencyCharts projectId={projectId} />
      <TimingBreakdown projectId={projectId} />
      <UptimeCharts projectId={projectId} />
      <DowntimeHistory projectId={projectId} />
      <UptimeHistoryCharts projectId={projectId} />
      <LatencyComparison projectId={projectId} />
    </div>
  );
}
