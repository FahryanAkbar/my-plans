"use client";

import React from "react";
import { Skeleton } from "@/components/atoms";

export const IssueDetailSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-10 w-3/4 rounded-2xl" />
      </div>
      <div className="space-y-4 bg-muted/20 p-6 rounded-[2rem]">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>
  );
};
