"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, Skeleton } from "@/components/atoms";
// import { useMonitoringResume } from "@/hooks";

export interface MonitoringResumeProps {
  className?: string;
  isLoading?: boolean;
  config?: {
    interval: number;
    url: string;
    checkSsl: boolean;
    lastCheckedAt?: number;
  } | null;
  latestMetric?: {
    isUp: boolean;
    latencyMs: number;
    sslValid?: boolean;
    sslIssuer?: string;
    sslValidTo?: number;
    statusCode?: number;
    errorMessage?: string;
  } | null;
  uptimePercentage?: number;
}

export function MonitoringResume({
  className,
  isLoading = false,
  config,
  latestMetric,
  uptimePercentage = 100,
}: MonitoringResumeProps) {
//   const {
//     statusInfo,
//     sslInfo,
//     relativeTime,
//     timeOfDay,
//     checkInterval,
//   } = useMonitoringResume({ config, latestMetric });

  if (isLoading) {
    return (
      <Card className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-0 shadow-sm border border-border/40", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "p-6 flex flex-col justify-between h-32.5 bg-card",
              i === 1 && "border-b sm:border-r lg:border-b-0 lg:border-r border-border/40",
              i === 2 && "border-b sm:border-b lg:border-b-0 lg:border-r border-border/40",
              i === 3 && "border-b sm:border-b-0 sm:border-r lg:border-r border-border/40",
              i === 4 && "border-none"
            )}
          >
            <Skeleton className="h-4 w-24 bg-slate-200/60 dark:bg-zinc-800" />
            <Skeleton className="h-8 w-32 bg-slate-200/60 dark:bg-zinc-800" />
            <Skeleton className="h-3.5 w-48 bg-slate-200/60 dark:bg-zinc-800" />
          </div>
        ))}
      </Card>
    );
  }

//   return (
//     <Card className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-0 shadow-sm border border-border/40 bg-card overflow-hidden", className)}>
//       <div className="p-6 flex flex-col justify-between h-32.5 border-b sm:border-r lg:border-b-0 lg:border-r border-border/40 bg-card">
//         <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
//           Status Uptime
//         </span>
//         <div className="flex items-center gap-2 my-1.5">
//           <span className={cn("text-3xl font-extrabold tracking-tight", statusInfo.textColor)}>
//             {statusInfo.text}
//           </span>
//           {statusInfo.showPulse && (
//             <span className="relative flex h-2.5 w-2.5">
//               <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusInfo.pulseBg)}></span>
//               <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", statusInfo.pulseBg)}></span>
//             </span>
//           )}
//         </div>
//         <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
//           {uptimePercentage.toFixed(2)}% Online
//         </span>
//       </div>

//       <div className="p-6 flex flex-col justify-between h-32.5 border-b sm:border-b lg:border-b-0 lg:border-r border-border/40 bg-card">
//         <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
//           Avg Response
//         </span>
//         <div className="flex items-baseline gap-0.5 my-1.5">
//           <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
//             {latestMetric ? Math.round(latestMetric.latencyMs) : "-"}
//           </span>
//           {latestMetric && (
//             <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-0.5">
//               ms
//             </span>
//           )}
//         </div>
//         <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
//           Average Website Respond the Request
//         </span>
//       </div>

//       <div className="p-6 flex flex-col justify-between h-32.5 border-b sm:border-b-0 sm:border-r lg:border-r border-border/40 bg-card">
//         <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
//           SSL Certificate
//         </span>
//         <div className="my-1.5">
//           <span className={cn("text-3xl font-extrabold tracking-tight", sslInfo.textColor)}>
//             {sslInfo.text}
//           </span>
//         </div>
//         <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate" title={sslInfo.description}>
//           {sslInfo.description}
//         </span>
//       </div>

//       <div className="p-6 flex flex-col justify-between h-32.5 border-none bg-card">
//         <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
//           Last Check
//         </span>
//         <div className="flex items-baseline gap-1 my-1.5">
//           <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
//             {relativeTime.value}
//           </span>
//           {relativeTime.unit && (
//             <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
//               {relativeTime.unit}
//             </span>
//           )}
//         </div>
//         <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
//           Every {checkInterval} Minute - Last update at {timeOfDay}
//         </span>
//       </div>
//     </Card>
//   );
}