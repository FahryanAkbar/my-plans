"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock, Globe, Shield, Wifi } from "lucide-react";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Typography,
} from "@/components/atoms";
import {
  LatencyCharts,
  DowntimeHistory,
  TimingBreakdown,
  UptimeCharts,
  UptimeHistoryCharts,
  LatencyComparison,
  NetworkFlow,
  MonitoringWebsitesToolbar,
  MonitoringWebsitesDetailCard,
  QosAnalysis,
} from "@/components/organisms";
import { useMonitoringWebsiteDetail } from "@/hooks";

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
  const { range, setRange, isLoading, activeConfig } = useMonitoringWebsiteDetail(
    projectId,
    configId,
  );

  if (isLoading) {
    return (
      <div className={cn("w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 animate-pulse", className)}>
        {/* Top Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-48 bg-muted rounded-md" />
          <div className="h-9 w-32 bg-muted rounded-xl" />
        </div>
        {/* Header Card Skeleton */}
        <div className="h-48 w-full rounded-2xl bg-muted/40 border border-border/30" />
        {/* Charts Skeletons */}
        <div className="h-80 w-full rounded-2xl bg-muted/40 border border-border/30" />
      </div>
    );
  }

  if (!activeConfig) {
    return (
      <div
        className={cn(
          "w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/50 bg-muted/10 rounded-2xl gap-4",
          className,
        )}
      >
        <Globe className="h-10 w-10 text-muted-foreground/50" />
        <div className="space-y-1">
          <Typography variant="h5" className="font-semibold text-foreground/80">
            Config Not Found
          </Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground/60">
            The requested monitoring configuration does not exist or has been deleted.
          </Typography>
        </div>
        <Link href={`/project/${projectId}?tab=monitoring`} passHref legacyBehavior>
          <Button size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Monitoring Configurations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      {/* Top Bar: Back Link & Global Date Range Selector */}
      <MonitoringWebsitesToolbar
        projectId={projectId}
        range={range}
        onChangeRange={setRange}
      />

      {/* Target Details Card */}
      <MonitoringWebsitesDetailCard activeConfig={activeConfig} />

      {/* Analytics Tabs for better UX */}
      <Tabs defaultValue="performance" className="w-full space-y-6">
        <div className="w-full border-b border-border/40">
          <TabsList variant="line" className="bg-transparent gap-6 h-10 px-0">
            <TabsTrigger 
              value="performance" 
              className="px-2 pb-3 text-sm font-semibold gap-2 bg-transparent border-0 flex-none data-active:text-primary data-active:after:bg-primary"
            >
              <Clock className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="uptime" 
              className="px-2 pb-3 text-sm font-semibold gap-2 bg-transparent border-0 flex-none data-active:text-primary data-active:after:bg-primary"
            >
              <Shield className="h-4 w-4" />
              Uptime & Incidents
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className="px-2 pb-3 text-sm font-semibold gap-2 bg-transparent border-0 flex-none data-active:text-primary data-active:after:bg-primary"
            >
              <Wifi className="h-4 w-4" />
              Network Flow
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="performance" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
          <LatencyCharts projectId={projectId} configId={configId} range={range} />
          <LatencyComparison projectId={projectId} configId={configId} range={range} />
          <QosAnalysis projectId={projectId} configId={configId} range={range} />
        </TabsContent>

        <TabsContent value="uptime" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <UptimeCharts projectId={projectId} configId={configId} range={range} />
            <UptimeHistoryCharts projectId={projectId} configId={configId} range={range} />
          </div>
          <DowntimeHistory projectId={projectId} configId={configId} range={range} />
        </TabsContent>

        <TabsContent value="network" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
          <NetworkFlow projectId={projectId} configId={configId} range={range} />
          <TimingBreakdown projectId={projectId} configId={configId} range={range} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
