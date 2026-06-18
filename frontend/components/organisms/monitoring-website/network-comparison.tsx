"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardTitle,
  CardDescription,
  Skeleton,
  Progress,
} from "@/components/atoms";

// import { useNetworkComparison } from "@/hooks";

export interface NetworkComparisonProps {
  className?: string;
  isLoading?: boolean;
  estimatedLoadTimeMs?: {
    WIFI: number;
    NETWORK_4G: number;
    NETWORK_3G: number;
    FAST_3G: number;
  } | null;
}

export function NetworkComparison({
  className,
  isLoading = false,
  estimatedLoadTimeMs,
}: NetworkComparisonProps) {
//   const {
//     times,
//     maxTime,
//     formatSeconds,
//     networkProfiles,
//   } = useNetworkComparison({ estimatedLoadTimeMs });

//   if (isLoading) {
//     return (
//       <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl", className)}>
//         <div className="flex flex-col gap-2 mb-6">
//           <Skeleton className="h-6 w-36 bg-slate-200/60 dark:bg-zinc-800" />
//           <Skeleton className="h-4 w-64 bg-slate-200/60 dark:bg-zinc-800" />
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="flex flex-col gap-2 bg-transparent">
//               <div className="flex items-center justify-between">
//                 <Skeleton className="h-4 w-12 bg-slate-100 dark:bg-zinc-900" />
//                 <Skeleton className="h-4 w-8 bg-slate-100 dark:bg-zinc-900" />
//               </div>
//               <Skeleton className="h-3.5 w-full bg-slate-100 dark:bg-zinc-900 rounded-full" />
//               <Skeleton className="h-3.5 w-16 bg-slate-100 dark:bg-zinc-900" />
//             </div>
//           ))}
//         </div>
//       </Card>
//     );
//   }

//   if (!times) {
//     return (
//       <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col justify-between", className)}>
//         <div>
//           <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
//             Kecepatan
//           </CardTitle>
//           <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//             Seberapa cepat website dalam berbagai jaringan
//           </CardDescription>
//         </div>
//         <div className="my-10 flex flex-col items-center justify-center text-center p-6 bg-transparent">
//           <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3">
//             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//             </svg>
//           </div>
//           <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Speed Data</span>
//           <span className="text-xs text-slate-500 dark:text-slate-400 max-w-72 mt-1 leading-normal">
//             We haven&apos;t recorded any speed metrics yet. Wait for the automatic checks to run.
//           </span>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6", className)}>
//       <div>
//         <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
//           Kecepatan
//         </CardTitle>
//         <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//           Seberapa cepat website dalam berbagai jaringan
//         </CardDescription>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 bg-transparent">
//         {networkProfiles.map((profile) => {
//           const percentage = (profile.timeMs / maxTime) * 100;
//           const secondsValue = formatSeconds(profile.timeMs);

//           return (
//             <div key={profile.key} className="flex flex-col justify-between h-17.5 bg-transparent">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
//                   {profile.label}
//                 </span>
//                 <div className="flex items-baseline gap-0.5">
//                   <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
//                     {secondsValue}
//                   </span>
//                   <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
//                     s
//                   </span>
//                 </div>
//               </div>

//               <Progress
//                 value={percentage}
//                 className="h-3.5 w-full bg-slate-100 dark:bg-zinc-800/80 rounded-full"
//                 indicatorClassName={cn("rounded-full", profile.colorClass)}
//               />

//               <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
//                 {profile.speedLabel}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </Card>
//   );
}