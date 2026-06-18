"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/atoms";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// import { useLatencyChart, LatencyMetric } from "@/hooks";
import { 
  HeaderChart,
  MonitoringTooltip, 
  MonitoringEmptyState, 
  MonitoringSkeletonLoading
} from "@/components/organisms";

export interface LatencyChartsProps {
  className?: string;
  isLoading?: boolean;
  // data?: LatencyMetric[];
}

export function LatencyCharts({
  className,
  isLoading = false,
  // data = [],
}: LatencyChartsProps) {
//   const {
//     isMounted,
//     sortedData,
//     minTime,
//     maxTime,
//     ticks,
//     maxYDomain,
//     formatXAxis,
//     formatYAxis,
//   } = useLatencyChart({ data });

//   if (isLoading || !isMounted) {
//     return <MonitoringSkeletonLoading className={className} />;
//   }

//   if (sortedData.length === 0) {
//     return (
//       <MonitoringEmptyState
//         className={className}
//         title="Latency History"
//         description="kecepatan respons server dalam 24 jam terakhir"
//         emptyTitle="No Latency Data"
//         emptyDescription="We haven't recorded any response latency for this website in the last 24 hours. Wait for the automatic checks to run."
//       />
//     );
//   }

  return (
    <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6", className)}>
      <HeaderChart
        title="Latency History"
        description="kecepatan respons server dalam 24 jam terakhir"
      />

      {/* <div className="h-75 w-full bg-transparent">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
          <AreaChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={true}
              horizontal={true}
              stroke="#e2e8f0"
              className="stroke-slate-100 dark:stroke-zinc-800/80"
              strokeDasharray="0"
            />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={[minTime, maxTime]}
              ticks={ticks}
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              domain={[0, maxYDomain]}
              width={45}
            />

            <Tooltip
              content={<MonitoringTooltip type="latency" />}
              cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
            />

            <Area
              type="monotone"
              dataKey="latencyMs"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#latencyGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1, fill: "#4f46e5" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div> */}
    </Card>
  );
}