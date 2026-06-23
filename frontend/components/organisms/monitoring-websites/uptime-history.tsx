"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/atoms";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  HeaderChart,
  MonitoringTooltip,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useProjectConfigs, useUptimeHistory } from "@/hooks";
import { normalizeUptimeData } from "@/lib";
import type { AnalyticsRange } from "@/types/features";

const UPTIME_HISTORY_RANGES: { label: string; value: AnalyticsRange; description: string }[] = [
  { label: "1H", value: "1h", description: "1 jam" },
  { label: "6H", value: "6h", description: "6 jam" },
  { label: "12H", value: "12h", description: "12 jam" },
  { label: "24H", value: "24h", description: "24 jam" },
  { label: "7D", value: "7d", description: "7 hari" },
  { label: "30D", value: "30d", description: "30 hari" },
];

export interface UptimeHistoryChartsProps {
  className?: string;
  projectId: string;
  configId?: string;
  range?: AnalyticsRange;
}

export function UptimeHistoryCharts({ className, projectId, configId, range: controlledRange }: UptimeHistoryChartsProps) {
  const [internalRange, setInternalRange] = React.useState<AnalyticsRange>("30d");
  const range = controlledRange ?? internalRange;
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);
  const { trend, isLoading, error } = useUptimeHistory(projectId, range, configId);
  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId, undefined, configId);
  const activeRange =
    UPTIME_HISTORY_RANGES.find((item) => item.value === range) ?? UPTIME_HISTORY_RANGES[5];
  const activeConfigIds = React.useMemo(
    () => new Set(configs.filter((config) => config.enabled && !config.isArchived).map((config) => config.id)),
    [configs],
  );
  const visibleTrend = React.useMemo(() => {
    if (activeConfigIds.size === 0) return [];
    return trend.filter((item) => activeConfigIds.has(item.configId) && (!configId || item.configId === configId));
  }, [activeConfigIds, configId, trend]);
  const shouldShowTimeTicks = range === "1h" || range === "6h" || range === "12h" || range === "24h";

  React.useEffect(() => {
    if (!visibleTrend || visibleTrend.length === 0) {
      setActiveConfigId(null);
      return;
    }

    if (!activeConfigId || !visibleTrend.some((item) => item.configId === activeConfigId)) {
      setActiveConfigId(visibleTrend[0].configId);
    }
  }, [activeConfigId, visibleTrend]);

  if (isLoading || isConfigsLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime History"
        description={`Persentase stabilitas dan waktu aktif website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleTrend || visibleTrend.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime History"
        description={`Persentase stabilitas dan waktu aktif website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Belum Ada Data"
        emptyDescription={`Belum ada data uptime yang tercatat untuk website ini dalam ${activeRange.description} terakhir. Tunggu pengecekan otomatis berjalan.`}
      />
    );
  }

  const selectedConfig = visibleTrend.find((item) => item.configId === activeConfigId) ?? visibleTrend[0];
  const { sortedData, minTime, maxTime, ticks, minYDomain, maxYDomain } =
    normalizeUptimeData(selectedConfig ? [selectedConfig] : []);

  if (sortedData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime History"
        description={`Persentase stabilitas dan waktu aktif website dalam ${activeRange.description} terakhir.`}
        emptyTitle="Belum Ada Data"
        emptyDescription="Belum ada data uptime yang tercatat untuk website ini."
      />
    );
  }

  return (
    <Card
      className={cn(
        "p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6",
        className,
      )}
    >
      <HeaderChart
        title="Website Uptime History"
        description={`Persentase stabilitas dan waktu aktif website dalam ${activeRange.description} terakhir.`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {!controlledRange ? (
          <div className="flex flex-wrap gap-2">
            {UPTIME_HISTORY_RANGES.map((item) => (
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

        {visibleTrend.length > 1 ? (
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:min-w-72">
            Monitoring config
            <select
              value={selectedConfig.configId}
              onChange={(event) => setActiveConfigId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {visibleTrend.map((item) => (
                <option key={item.configId} value={item.configId}>
                  {item.url || item.configId}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="min-w-0 text-sm font-medium text-muted-foreground">
            {selectedConfig.url}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300} debounce={100}>
        <LineChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            vertical
            horizontal
            stroke="#e2e8f0"
            className="stroke-slate-100 dark:stroke-zinc-800/80"
            strokeDasharray="0"
          />

          {/* Reference line at 99% SLA threshold */}
          <ReferenceLine
            y={99}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: "99%", position: "right", fill: "#f59e0b", fontSize: 10 }}
          />

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={[minTime, maxTime]}
            ticks={ticks}
            tickFormatter={(ts: number) =>
              shouldShowTimeTicks
                ? new Date(ts).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date(ts).toLocaleDateString("id-ID", {
                    month: "short",
                    day: "numeric",
                  })
            }
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            domain={[minYDomain, maxYDomain]}
            width={45}
          />

          <Tooltip
            content={<MonitoringTooltip type="uptime" />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
          />

          <Line
            type="monotone"
            dataKey="uptimePercentage"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
