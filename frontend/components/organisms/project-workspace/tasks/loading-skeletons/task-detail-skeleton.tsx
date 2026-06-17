"use client";

import React from "react";
import { Skeleton } from "@/components/atoms";

export const TaskDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="bg-muted/30 rounded-2xl p-4 space-y-4 border border-border/50">
        <div className="grid grid-cols-3 items-center py-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32 col-span-2" />
        </div>
        <div className="grid grid-cols-3 items-center py-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32 col-span-2" />
        </div>
      </div>
    </div>
  );
};
