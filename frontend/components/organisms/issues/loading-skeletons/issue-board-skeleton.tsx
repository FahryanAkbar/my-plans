"use client";

import React from "react";
import { Skeleton } from "@/components/atoms";

export const IssueBoardSkeleton = () => {
  return (
    <div className="flex gap-x-6 overflow-x-auto pb-10 scrollbar-hide">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col w-80 shrink-0 gap-y-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-6 rounded-md" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
