"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/atoms";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  HeaderChart,
  MonitoringTooltip,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
  ComparisonTable,
} from "@/components/organisms";

import { useLatencyComparison } from "@/hooks";
import { normalizeComparisonData } from "@/lib";
import type { AnalyticsRange } from "@/types/features";


export interface LatencyComparisonProps {
  className?: string;
  projectId: string;
  configId?: string;
  range?: AnalyticsRange;
}


export function LatencyComparison({ className, projectId, configId, range }: LatencyComparisonProps) {
  const { data, isLoading, error } = useLatencyComparison(projectId, range, configId);
  const visibleData = React.useMemo(
    () => data.filter((item) => !configId || item.configId === configId),
    [configId, data],
  );

  if (isLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Latency Comparison"
        description="Perbandingan performa latency Anda dengan Google PageSpeed TTFB"
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleData || visibleData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Latency Comparison"
        description="Perbandingan performa latency Anda dengan Google PageSpeed TTFB"
        emptyTitle="Belum Ada Data"
        emptyDescription="Belum ada data perbandingan latency. Tunggu pengecekan otomatis berjalan."
      />
    );
  }

  const { sortedData, minTime, maxTime, ticks, maxYDomain } =
    normalizeComparisonData(visibleData);

  if (sortedData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Latency Comparison"
        description="Perbandingan performa latency Anda dengan Google PageSpeed TTFB"
        emptyTitle="Belum Ada Data"
        emptyDescription="Belum ada data perbandingan latency untuk website ini."
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
        title="Latency Comparison"
        description="Perbandingan performa latency Anda dengan Google PageSpeed TTFB"
        showLegend={true}
      />

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
            content={<MonitoringTooltip type="comparison" />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
          />

          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) =>
              value === "latencyMs" ? "Real Data (Local)" : "Predicted (Google)"
            }
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />

          {/* Predicted (Google TTFB) – Indigo */}
          <Line
            type="monotone"
            dataKey="googleTtfb"
            name="googleTtfb"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, fill: "#6366f1" }}
            connectNulls
          />

          {/* Real latency – Emerald */}
          <Line
            type="monotone"
            dataKey="latencyMs"
            name="latencyMs"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Comparison table (timestamp | real | predicted | deviation) */}
      <ComparisonTable data={sortedData} />
    </Card>
  );
}
