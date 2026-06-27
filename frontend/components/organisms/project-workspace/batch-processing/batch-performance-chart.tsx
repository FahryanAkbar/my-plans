"use client";

import React from "react";
import { Activity, Database } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Typography,
} from "@/components/atoms";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartItem {
  date: string;
  "Avg Latency (ms)": number;
  "Uptime (%)": number;
}

interface BatchPerformanceChartProps {
  chartData: ChartItem[];
  isLoading: boolean;
}

export function BatchPerformanceChart({
  chartData,
  isLoading,
}: BatchPerformanceChartProps) {
  return (
    <Card className="border border-border/40 bg-card/25 shadow-sm p-6">
      <CardHeader className="px-0 pt-0 pb-6">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-primary" />
          Dual-Axis Performance Analytics
        </CardTitle>
        <CardDescription className="text-xs">
          Correlate average response latency and uptime ratio over the current
          batch duration.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="h-72 w-full animate-pulse bg-muted/20 border border-border/20 rounded-xl" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: -5, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="latencyAreaColor"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#f1f5f9"
                className="stroke-slate-100 dark:stroke-zinc-800/60"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />

              {/* Y-Axis Left (Latency) */}
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `${v}ms`}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />

              {/* Y-Axis Right (Uptime) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[90, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "11px",
                }}
                itemStyle={{ padding: "1px 0" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: "11px" }}
              />

              {/* Uptime Bar */}
              <Bar
                yAxisId="right"
                dataKey="Uptime (%)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                opacity={0.65}
                barSize={20}
              />

              {/* Latency Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Avg Latency (ms)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-border/30 rounded-xl space-y-2 bg-muted/5">
            <Database className="h-8 w-8 text-muted-foreground/30" />
            <Typography className="text-xs text-muted-foreground/60">
              No batch aggregate data available. Run manual pipeline to generate
              statistics.
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
