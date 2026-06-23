"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/atoms";

import {
  HeaderChart,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useProjectConfigs, useUptimeStats } from "@/hooks";
import type { AnalyticsRange } from "@/types/features";

const UPTIME_RANGES: { label: string; value: AnalyticsRange; description: string }[] = [
  { label: "1H", value: "1h", description: "1 jam" },
  { label: "6H", value: "6h", description: "6 jam" },
  { label: "12H", value: "12h", description: "12 jam" },
  { label: "24H", value: "24h", description: "24 jam" },
  { label: "7D", value: "7d", description: "7 hari" },
  { label: "30D", value: "30d", description: "30 hari" },
];

export interface UptimeChartsProps {
  className?: string;
  projectId: string;
  configId?: string;
  range?: AnalyticsRange;
}

export function UptimeCharts({ className, projectId, configId, range: controlledRange }: UptimeChartsProps) {
  const [internalRange, setInternalRange] = React.useState<AnalyticsRange>("24h");
  const range = controlledRange ?? internalRange;
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);
  const { stats, isLoading, error } = useUptimeStats(projectId, range, configId);
  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId, undefined, configId);
  const activeRange = UPTIME_RANGES.find((item) => item.value === range) ?? UPTIME_RANGES[3];
  const activeConfigIds = React.useMemo(
    () => new Set(configs.filter((config) => config.enabled && !config.isArchived).map((config) => config.id)),
    [configs],
  );
  const visibleStats = React.useMemo(() => {
    if (activeConfigIds.size === 0) return [];
    return stats.filter((item) => activeConfigIds.has(item.configId) && (!configId || item.configId === configId));
  }, [activeConfigIds, configId, stats]);

  React.useEffect(() => {
    if (!visibleStats || visibleStats.length === 0) {
      setActiveConfigId(null);
      return;
    }

    if (!activeConfigId || !visibleStats.some((item) => item.configId === activeConfigId)) {
      setActiveConfigId(visibleStats[0].configId);
    }
  }, [activeConfigId, visibleStats]);

  if (isLoading || isConfigsLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime"
        description={`Rekap stabilitas website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleStats || visibleStats.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime"
        description={`Rekap stabilitas website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Belum Ada Data"
        emptyDescription={`Belum ada data uptime yang tercatat untuk config aktif dalam ${activeRange.description} terakhir.`}
      />
    );
  }

  const selectedStats = visibleStats.find((item) => item.configId === activeConfigId) ?? visibleStats[0];
  const successRate = Math.max(0, Math.min(selectedStats.uptimePercentage, 100));
  const failRate = 100 - successRate;
  const statusLabel = successRate >= 99 ? "Healthy" : successRate >= 95 ? "Degraded" : "Unstable";
  const statusClassName =
    successRate >= 99
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : successRate >= 95
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";

  return (
    <Card
      className={cn(
        "p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6",
        className,
      )}
    >
      <HeaderChart
        title="Website Uptime"
        description={`Rekap stabilitas website dalam ${activeRange.description} terakhir.`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {!controlledRange ? (
          <div className="flex flex-wrap gap-2">
            {UPTIME_RANGES.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={range === item.value ? "default" : "outline"}
                className="h-8 min-w-12 rounded-lg px-3 text-xs font-semibold"
                onClick={() => setInternalRange(item.value)}
                aria-pressed={range === item.value}
              >
                {item.label}
              </Button>
            ))}
          </div>
        ) : (
          <div />
        )}

        {visibleStats.length > 1 ? (
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:min-w-72">
            Monitoring config
            <select
              value={selectedStats.configId}
              onChange={(event) => setActiveConfigId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {visibleStats.map((item) => (
                <option key={item.configId} value={item.configId}>
                  {item.url || item.configId}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="min-w-0 text-sm font-medium text-muted-foreground">
            {selectedStats.url}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border/50 bg-background p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uptime</p>
              <p className="mt-2 text-4xl font-semibold tracking-normal text-foreground">
                {selectedStats.uptimePercentage.toFixed(3)}%
              </p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusClassName)}>
              {statusLabel}
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/40">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${successRate}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{successRate.toFixed(2)}% success</span>
            <span>{failRate.toFixed(2)}% failed</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
          <UptimeStatCard label="Total" value={selectedStats.totalChecks} />
          <UptimeStatCard label="Success" value={selectedStats.successCount} className="text-emerald-600" />
          <UptimeStatCard label="Failed" value={selectedStats.failCount} className="text-rose-600" />
        </div>
      </div>
    </Card>
  );
}

function UptimeStatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-normal text-foreground", className)}>
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
