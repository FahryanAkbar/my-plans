"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/atoms";

import {
  HeaderChart,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useProjectConfigs, useTimingBreakdown } from "@/hooks";
import type { AnalyticsRange, TimingBreakdownResponse } from "@/types/features";

const TIMING_RANGES: { label: string; value: AnalyticsRange; description: string }[] = [
  { label: "1H", value: "1h", description: "1 jam" },
  { label: "6H", value: "6h", description: "6 jam" },
  { label: "12H", value: "12h", description: "12 jam" },
  { label: "24H", value: "24h", description: "24 jam" },
  { label: "7D", value: "7d", description: "7 hari" },
  { label: "30D", value: "30d", description: "30 hari" },
];

const TIMING_SEGMENTS: {
  key: keyof Pick<TimingBreakdownResponse, "dns" | "tcp" | "tls" | "ttfb" | "download">;
  label: string;
  color: string;
}[] = [
  { key: "dns", label: "DNS", color: "bg-sky-500" },
  { key: "tcp", label: "TCP", color: "bg-indigo-500" },
  { key: "tls", label: "TLS", color: "bg-violet-500" },
  { key: "ttfb", label: "TTFB", color: "bg-amber-500" },
  { key: "download", label: "Download", color: "bg-emerald-500" },
];

export interface TimingBreakdownProps {
  className?: string;
  projectId: string;
  configId?: string;
}

export function TimingBreakdown({ className, projectId, configId }: TimingBreakdownProps) {
  const [range, setRange] = React.useState<AnalyticsRange>("24h");
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);
  const { breakdown, isLoading, error } = useTimingBreakdown(projectId, range, configId);
  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId, undefined, configId);
  const activeRange = TIMING_RANGES.find((item) => item.value === range) ?? TIMING_RANGES[3];
  const activeConfigIds = React.useMemo(
    () => new Set(configs.filter((config) => config.enabled && !config.isArchived).map((config) => config.id)),
    [configs],
  );
  const visibleBreakdown = React.useMemo(() => {
    if (activeConfigIds.size === 0) return [];
    return breakdown.filter((item) => activeConfigIds.has(item.configId) && (!configId || item.configId === configId));
  }, [activeConfigIds, breakdown, configId]);

  React.useEffect(() => {
    if (!visibleBreakdown || visibleBreakdown.length === 0) {
      setActiveConfigId(null);
      return;
    }

    if (!activeConfigId || !visibleBreakdown.some((item) => item.configId === activeConfigId)) {
      setActiveConfigId(visibleBreakdown[0].configId);
    }
  }, [activeConfigId, visibleBreakdown]);

  if (isLoading || isConfigsLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Timing Breakdown"
        description={`Rata-rata rincian waktu respons jaringan dalam ${activeRange.description} terakhir.`}
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleBreakdown || visibleBreakdown.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Timing Breakdown"
        description={`Rata-rata rincian waktu respons jaringan dalam ${activeRange.description} terakhir.`}
        emptyTitle="Belum Ada Data"
        emptyDescription={`Belum ada data timing breakdown untuk config aktif dalam ${activeRange.description} terakhir.`}
      />
    );
  }

  const selectedBreakdown =
    visibleBreakdown.find((item) => item.configId === activeConfigId) ?? visibleBreakdown[0];
  const totalTiming = TIMING_SEGMENTS.reduce(
    (total, segment) => total + Number(selectedBreakdown[segment.key] || 0),
    0,
  );
  const slowestSegment = TIMING_SEGMENTS.reduce((current, segment) => {
    const currentValue = Number(selectedBreakdown[current.key] || 0);
    const segmentValue = Number(selectedBreakdown[segment.key] || 0);
    return segmentValue > currentValue ? segment : current;
  }, TIMING_SEGMENTS[0]);

  return (
    <Card
      className={cn(
        "p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6",
        className,
      )}
    >
      <HeaderChart
        title="Timing Breakdown"
        description={`Rata-rata rincian waktu respons jaringan dalam ${activeRange.description} terakhir.`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TIMING_RANGES.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={range === item.value ? "default" : "outline"}
              className="h-8 min-w-12 rounded-lg px-3 text-xs font-semibold"
              onClick={() => setRange(item.value)}
              aria-pressed={range === item.value}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {visibleBreakdown.length > 1 ? (
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:min-w-72">
            Monitoring config
            <select
              value={selectedBreakdown.configId}
              onChange={(event) => setActiveConfigId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {visibleBreakdown.map((item) => (
                <option key={item.configId} value={item.configId}>
                  {item.url || item.configId}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="min-w-0 text-sm font-medium text-muted-foreground">
            {selectedBreakdown.url}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-xl border border-border/50 bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">Average total timing</p>
          <p className="mt-2 text-4xl font-semibold tracking-normal text-foreground">
            {formatTiming(totalTiming)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Slowest segment: <span className="font-semibold text-foreground">{slowestSegment.label}</span>
          </p>

          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-muted">
            {TIMING_SEGMENTS.map((segment) => {
              const value = Number(selectedBreakdown[segment.key] || 0);
              const width = totalTiming > 0 ? (value / totalTiming) * 100 : 0;
              return (
                <div
                  key={segment.key}
                  className={cn("h-full transition-all", segment.color)}
                  style={{ width: `${width}%` }}
                  title={`${segment.label}: ${formatTiming(value)}`}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {TIMING_SEGMENTS.map((segment) => {
            const value = Number(selectedBreakdown[segment.key] || 0);
            const percentage = totalTiming > 0 ? (value / totalTiming) * 100 : 0;

            return (
              <div key={segment.key} className="rounded-xl border border-border/50 bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", segment.color)} />
                    <p className="text-sm font-semibold text-foreground">{segment.label}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
                  {formatTiming(value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function formatTiming(value: number) {
  return `${value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })} ms`;
}
