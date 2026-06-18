"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/atoms";

import {
  HeaderChart,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useDowntimeHistory, useProjectConfigs } from "@/hooks";
import type { AnalyticsRange } from "@/types/features";

const DOWNTIME_RANGES: { label: string; value: AnalyticsRange; description: string }[] = [
  { label: "1H", value: "1h", description: "1 jam" },
  { label: "6H", value: "6h", description: "6 jam" },
  { label: "12H", value: "12h", description: "12 jam" },
  { label: "24H", value: "24h", description: "24 jam" },
  { label: "7D", value: "7d", description: "7 hari" },
  { label: "30D", value: "30d", description: "30 hari" },
];

export interface DowntimeHistoryProps {
  className?: string;
  projectId: string;
  configId?: string;
}

export function DowntimeHistory({ className, projectId, configId }: DowntimeHistoryProps) {
  const [range, setRange] = React.useState<AnalyticsRange>("7d");
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);
  const { events, isLoading, error } = useDowntimeHistory(projectId, range, configId);
  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId, undefined, configId);
  const activeRange = DOWNTIME_RANGES.find((item) => item.value === range) ?? DOWNTIME_RANGES[4];
  const activeConfigIds = React.useMemo(
    () => new Set(configs.filter((config) => config.enabled && !config.isArchived).map((config) => config.id)),
    [configs],
  );
  const visibleEvents = React.useMemo(() => {
    if (activeConfigIds.size === 0) return [];
    return events
      .filter((event) => activeConfigIds.has(event.configId) && (!configId || event.configId === configId))
      .sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  }, [activeConfigIds, events, configId]);
  const configOptions = React.useMemo(() => {
    const uniqueConfigs = new Map<string, string>();
    visibleEvents.forEach((event) => uniqueConfigs.set(event.configId, event.url));
    return Array.from(uniqueConfigs, ([configId, url]) => ({ configId, url }));
  }, [visibleEvents]);

  React.useEffect(() => {
    if (configOptions.length === 0) {
      setActiveConfigId(null);
      return;
    }

    if (activeConfigId && configOptions.some((item) => item.configId === activeConfigId)) {
      return;
    }

    setActiveConfigId(configOptions[0].configId);
  }, [activeConfigId, configOptions]);

  if (isLoading || isConfigsLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Downtime History"
        description={`Riwayat kegagalan akses website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleEvents || visibleEvents.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Downtime History"
        description={`Riwayat kegagalan akses website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Tidak Ada Downtime"
        emptyDescription={`Tidak ada event downtime untuk config aktif dalam ${activeRange.description} terakhir.`}
      />
    );
  }

  const selectedEvents = activeConfigId
    ? visibleEvents.filter((event) => event.configId === activeConfigId)
    : visibleEvents;
  const selectedUrl = configOptions.find((item) => item.configId === activeConfigId)?.url;
  const averageLatency =
    selectedEvents.length > 0
      ? Math.round(selectedEvents.reduce((total, event) => total + event.latency, 0) / selectedEvents.length)
      : 0;

  return (
    <Card
      className={cn(
        "p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6",
        className,
      )}
    >
      <HeaderChart
        title="Downtime History"
        description={`Riwayat kegagalan akses website dalam ${activeRange.description} terakhir.`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {DOWNTIME_RANGES.map((item) => (
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

        {configOptions.length > 1 ? (
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:min-w-72">
            Monitoring config
            <select
              value={activeConfigId ?? configOptions[0].configId}
              onChange={(event) => setActiveConfigId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {configOptions.map((item) => (
                <option key={item.configId} value={item.configId}>
                  {item.url || item.configId}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="min-w-0 text-sm font-medium text-muted-foreground">
            {selectedUrl}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <DowntimeSummaryCard label="Events" value={selectedEvents.length.toLocaleString("id-ID")} />
        <DowntimeSummaryCard label="Avg latency" value={`${averageLatency.toLocaleString("id-ID")} ms`} />
        <DowntimeSummaryCard label="Latest status" value={String(selectedEvents[0]?.statusCode ?? "-")} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50">
        <div className="max-h-96 overflow-auto">
          <table className="w-full min-w-180 border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              <tr className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody>
              {selectedEvents.map((event) => (
                <tr key={`${event.configId}-${event.time}`} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {formatDowntimeTime(event.time)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      {event.statusCode || "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.latency.toLocaleString("id-ID")} ms
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.errorMessage || "Request failed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function DowntimeSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{value}</p>
    </div>
  );
}

function formatDowntimeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
