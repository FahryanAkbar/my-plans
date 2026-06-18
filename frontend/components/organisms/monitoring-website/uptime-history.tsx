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
  MonitoringSkeletonLoading
} from "@/components/organisms";
// import { useUptimeHistory, type DailyUptimeMetric } from "@/hooks";

export interface UptimeHistoryChartsProps {
  className?: string;
  isLoading?: boolean;
//   data?: DailyUptimeMetric[];
}

export function UptimeHistoryCharts({
  className,
  isLoading = false,
//   data,
}: UptimeHistoryChartsProps) {
//   const {
//     isMounted,
//     finalData,
//     minTime,
//     maxTime,
//     ticks,
//     minYDomain,
//     maxYDomain,
//     formatXAxis,
//     formatYAxis,
//   } = useUptimeHistory({ data });

//   if (isLoading || !isMounted) {
//     return <MonitoringSkeletonLoading className={className} />;
//   }

//   if (finalData.length === 0) {
//     return (
//       <MonitoringEmptyState
//         className={className}
//         title="Website Uptime History"
//         description="Persentase stabilitas dan waktu aktif website dalam 30 hari terakhir."
//         emptyTitle="No Uptime History"
//         emptyDescription="We haven't recorded any uptime history for this website in the last 30 days. Wait for the automatic checks to run."
//       />
//     );
//   }

//   return (
//     <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6", className)}>
//       <HeaderChart
//         title="Website Uptime History"
//         description="Persentase stabilitas dan waktu aktif website dalam 30 hari terakhir."
//       />

//       <div className="h-75 w-full bg-transparent">
//         <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
//           <LineChart
//             data={finalData}
//             margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
//           >
//             <CartesianGrid
//               vertical={true}
//               horizontal={true}
//               stroke="#e2e8f0"
//               className="stroke-slate-100 dark:stroke-zinc-800/80"
//               strokeDasharray="0"
//             />

//             <XAxis
//               dataKey="date"
//               type="number"
//               domain={[minTime, maxTime]}
//               ticks={ticks}
//               tickFormatter={formatXAxis}
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
//               dy={10}
//             />

//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tickFormatter={formatYAxis}
//               tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
//               domain={[minYDomain, maxYDomain]}
//               width={45}
//             />

//             <Tooltip
//               content={<MonitoringTooltip type="uptime" />}
//               cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
//             />

//             <Line
//               type="monotone"
//               dataKey="uptimePercentage"
//               stroke="#10b981"
//               strokeWidth={2}
//               dot={false}
//               activeDot={{ r: 4, strokeWidth: 1, fill: "#10b981" }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
 // );
}