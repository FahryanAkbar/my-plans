"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, Skeleton } from "@/components/atoms";

export interface MonitoringSkeletonLoadingProps {
  className?: string;
  showTable?: boolean;
}

export function MonitoringSkeletonLoading({
  className,
  showTable = false,
}: MonitoringSkeletonLoadingProps) {
  return (
    <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl", className)}>
      <div className="flex flex-col gap-2 mb-6">
        <Skeleton className="h-6 w-48 bg-slate-200/60 dark:bg-zinc-800" />
        <Skeleton className="h-4 w-64 bg-slate-200/60 dark:bg-zinc-800" />
      </div>
      <div className={cn("h-75 w-full flex items-end justify-between gap-4", showTable && "mb-6")}>
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full bg-slate-100/85 dark:bg-zinc-800/85 rounded-t-md" 
            style={{ height: `${30 + Math.sin(i) * 20 + (i % 2) * 15}%` }}
          />
        ))}
      </div>
      {showTable && (
        <div className="flex flex-col gap-3 mt-6">
          <Skeleton className="h-10 w-full bg-slate-100/80 dark:bg-zinc-900" />
          <Skeleton className="h-8 w-full bg-slate-100/50 dark:bg-zinc-900/50" />
          <Skeleton className="h-8 w-full bg-slate-100/50 dark:bg-zinc-900/50" />
        </div>
      )}
    </Card>
  );
}