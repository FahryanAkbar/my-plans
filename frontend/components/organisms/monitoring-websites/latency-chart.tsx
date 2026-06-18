"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/atoms";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  HeaderChart,
  MonitoringTooltip,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useLatencyHistory, useProjectConfigs } from "@/hooks";
import { normalizeLatencyData } from "@/lib";
import type { AnalyticsRange } from "@/types/features";

const LATENCY_RANGES: { label: string; value: AnalyticsRange; description: string }[] = [
  { label: "1H", value: "1h", description: "1 jam" },
  { label: "6H", value: "6h", description: "6 jam" },
  { label: "12H", value: "12h", description: "12 jam" },
  { label: "24H", value: "24h", description: "24 jam" },
  { label: "7D", value: "7d", description: "7 hari" },
  { label: "30D", value: "30d", description: "30 hari" },
];

const CONFIG_COLORS = ["#4f46e5", "#0f766e", "#f97316", "#be123c", "#7c3aed", "#0284c7"];

export interface LatencyChartsProps {
  className?: string;
  projectId: string;
  configId?: string;
}

export function LatencyCharts({ className, projectId, configId }: LatencyChartsProps) {
  const [range, setRange] = React.useState<AnalyticsRange>("1h");
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);
  const { data, isLoading, error } = useLatencyHistory(projectId, range, configId);
  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId, undefined, configId);
  const activeRange = LATENCY_RANGES.find((item) => item.value === range) ?? LATENCY_RANGES[0];
  const activeConfigIds = React.useMemo(
    () => new Set(configs.filter((config) => config.enabled && !config.isArchived).map((config) => config.id)),
    [configs],
  );
  const visibleData = React.useMemo(() => {
    if (activeConfigIds.size === 0) return [];
    return data.filter((item) => activeConfigIds.has(item.configId) && (!configId || item.configId === configId));
  }, [activeConfigIds, configId, data]);

  React.useEffect(() => {
    if (!visibleData || visibleData.length === 0) {
      setActiveConfigId(null);
      return;
    }

    if (!activeConfigId || !visibleData.some((item) => item.configId === activeConfigId)) {
      setActiveConfigId(visibleData[0].configId);
    }
  }, [activeConfigId, visibleData]);

  if (isLoading || isConfigsLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Latency History"
        description={`Kecepatan respons server dalam ${activeRange.description} terakhir.`}
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleData || visibleData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Latency History"
        description={`Kecepatan respons server dalam ${activeRange.description} terakhir.`}
        emptyTitle="Belum Ada Data"
        emptyDescription={`Belum ada data latency yang tercatat untuk website ini dalam ${activeRange.description} terakhir. Tunggu pengecekan otomatis berjalan.`}
      />
    );
  }

  const selectedConfig = visibleData.find((item) => item.configId === activeConfigId) ?? visibleData[0];
  const { sortedData, minTime, maxTime, ticks, maxYDomain } =
    normalizeLatencyData(selectedConfig ? [selectedConfig] : []);
  const selectedConfigIndex = Math.max(
    visibleData.findIndex((item) => item.configId === selectedConfig?.configId),
    0,
  );
  const chartColor = CONFIG_COLORS[selectedConfigIndex % CONFIG_COLORS.length];
  const gradientId = `latencyGradient-${selectedConfig?.configId ?? "default"}`;

  if (sortedData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Latency History"
        description={`Kecepatan respons server dalam ${activeRange.description} terakhir.`}
        emptyTitle="Belum Ada Data"
        emptyDescription={`Belum ada data latency yang tercatat untuk website ini dalam ${activeRange.description} terakhir.`}
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
        title="Latency History"
        description={`Kecepatan respons server dalam ${activeRange.description} terakhir.`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {LATENCY_RANGES.map((item) => (
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

        {visibleData.length > 1 ? (
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:min-w-72">
            Monitoring config
            <select
              value={selectedConfig.configId}
              onChange={(event) => setActiveConfigId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {visibleData.map((item) => (
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
        <AreaChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical
            horizontal
            stroke="#e2e8f0"
            className="stroke-slate-100 dark:stroke-zinc-800/80"
            strokeDasharray="0"
          />

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={[minTime, maxTime]}
            ticks={ticks}
            tickFormatter={(ts: number) =>
              new Date(ts).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
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
            tickFormatter={(v: number) => `${v} ms`}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            domain={[0, maxYDomain]}
            width={55}
          />

          <Tooltip
            content={<MonitoringTooltip type="latency" />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
          />

          <Area
            type="monotone"
            dataKey="latencyMs"
            stroke={chartColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, fill: chartColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
