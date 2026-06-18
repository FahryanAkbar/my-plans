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
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  HeaderChart,
  MonitoringTooltip,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useUptimeHistory } from "@/hooks";
import { normalizeUptimeData } from "@/lib";


export interface UptimeHistoryChartsProps {
  className?: string;
  projectId: string;
}

export function UptimeHistoryCharts({ className, projectId }: UptimeHistoryChartsProps) {
  const { trend, isLoading, error } = useUptimeHistory(projectId);

  if (isLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime History"
        description="Persentase stabilitas dan waktu aktif website dalam 30 hari terakhir."
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!trend || trend.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime History"
        description="Persentase stabilitas dan waktu aktif website dalam 30 hari terakhir."
        emptyTitle="Belum Ada Data"
        emptyDescription="Belum ada data uptime yang tercatat untuk website ini dalam 30 hari terakhir. Tunggu pengecekan otomatis berjalan."
      />
    );
  }

  const { sortedData, minTime, maxTime, ticks, minYDomain, maxYDomain } =
    normalizeUptimeData(trend);

  if (sortedData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Website Uptime History"
        description="Persentase stabilitas dan waktu aktif website dalam 30 hari terakhir."
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
        description="Persentase stabilitas dan waktu aktif website dalam 30 hari terakhir."
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
              new Date(ts).toLocaleDateString("id-ID", {
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