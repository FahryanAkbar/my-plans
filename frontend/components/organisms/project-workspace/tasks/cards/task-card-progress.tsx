"use client";

import React from "react";
import { Progress } from "@/components/atoms";
import { TaskStatus as TaskStatusEnum, TASK_STATUS } from "@/lib";
import { cn } from "@/lib/utils";

interface TaskCardProgressProps {
  totalActualHours: number;
  effectiveEstimation: number;
  isAutoEstimation: boolean;
  status: TaskStatusEnum;
  progress?: number;
}

export const TaskCardProgress = ({
  totalActualHours,
  effectiveEstimation,
  isAutoEstimation,
  status,
  progress,
}: TaskCardProgressProps) => {
  // Only show if there's tracking data or explicit progress
  if (!(isAutoEstimation 
    ? (totalActualHours > 0 || status === TASK_STATUS.IN_PROGRESS) 
    : (effectiveEstimation > 0 || progress !== undefined))
  ) return null;

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-medium text-muted-foreground">
           {isAutoEstimation ? "Time Tracking" : "Time Investment"}
         </span>
         <span className={cn(
           "text-[10px] font-bold",
           totalActualHours > effectiveEstimation ? "text-red-500 animate-pulse" : "text-foreground"
         )}>
           {totalActualHours} / {effectiveEstimation} hrs
           {isAutoEstimation && <span className="ml-1 text-[8px] text-muted-foreground font-normal italic">(auto)</span>}
         </span>
      </div>
      <Progress 
        value={Math.min((totalActualHours / effectiveEstimation) * 100, 100)} 
        className="h-1" 
        indicatorClassName={cn(
          totalActualHours > effectiveEstimation 
            ? "bg-red-500" 
            : totalActualHours >= effectiveEstimation * 0.8 
            ? "bg-amber-500"
            : "bg-primary"
        )}
      />
    </div>
  );
};
