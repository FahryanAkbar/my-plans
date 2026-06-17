"use client";

import React from "react";
import { Skeleton } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface TaskBoardSkeletonProps {
  columnCount?: number;
  cardCountPerColumn?: number;
  className?: string;
}

export const TaskBoardSkeleton = ({
  columnCount = 4,
  cardCountPerColumn = 3,
  className,
}: TaskBoardSkeletonProps) => {
  return (
    <div className={cn("flex gap-x-6 overflow-x-auto pb-10 scrollbar-hide", className)}>
      {Array.from({ length: columnCount }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex flex-col w-80 shrink-0 gap-y-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-6 rounded-md" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: cardCountPerColumn }).map((_, cardIndex) => (
              <Skeleton key={cardIndex} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
