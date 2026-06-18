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
} from "recharts";
import { 
  HeaderChart,
  MonitoringTooltip, 
  MonitoringEmptyState, 
  MonitoringSkeletonLoading,
  ComparisonTable
} from "@/components/organisms";
import { useLatencyComparison } from "@/hooks";

export interface LatencyComparisonProps {
  className?: string;
  isLoading?: boolean;
  // data?: LatencyComparisonData[];
}

export function LatencyComparison({
  className,
  isLoading = false,
  // data,
}: LatencyComparisonProps) {
  // const {
  //   isMounted,
  //   finalData,
  //   minTime,
  //   maxTime,
  //   ticks,
  //   maxYDomain,
  //   formatXAxis,
  //   formatYAxis,
  // } = useLatencyComparison({ data });

  // if (isLoading || !isMounted) {
  //   return <MonitoringSkeletonLoading className={className} showTable={true} />;
  // }

  // if (finalData.length === 0) {
  //   return (
  //     <MonitoringEmptyState
  //       className={className}
  //       title="Latency Comparation"
  //       description="Perbandingan performa latency Anda dengan Google PageSpeed TTFB"
  //       emptyTitle="No Comparison Data"
  //       emptyDescription="We haven't recorded any latency comparison data yet. Wait for the automatic checks to run."
  //     />
  //   );
  // }

  return (
    <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6", className)}>
      <HeaderChart
        title="Latency Comparation"
        showLegend={true}
      />

      {/* <div className="h-75 w-full bg-transparent">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
          <LineChart
            data={finalData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
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
              content={<MonitoringTooltip type="comparison" />}
              cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
            />

            <Line
              type="monotone"
              dataKey="googleTtfb"
              name="Predicted"
              stroke="#6366f1" // Indigo 500
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1, fill: "#6366f1" }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="latencyMs"
              name="Real Data"
              stroke="#10b981" // Emerald 500
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ComparisonTable data={finalData} /> */}
    </Card>
  );
}