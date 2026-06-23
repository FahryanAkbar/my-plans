"use client";

import React from "react";
import { Skeleton } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface OverviewTaskSkeletonProps {
  itemCount?: number;
  titleWidth?: string;
  variant?: "feed" | "list" | "card";
  className?: string;
}

export const OverviewTaskSkeleton = ({
  itemCount = 4,
  titleWidth = "w-40",
  variant = "feed",
  className,
}: OverviewTaskSkeletonProps) => {
  return (
    <div className={cn("flex flex-col gap-y-8", className)}>
      <div className="flex items-center justify-between py-2">
        <Skeleton className={cn("h-8 rounded-lg", titleWidth)} />
        {variant === "feed" && <Skeleton className="h-6 w-16 rounded-full" />}
      </div>

      {(variant === "feed" || variant === "list") && (
        <div className={cn("mt-4", variant === "feed" ? "space-y-10" : "space-y-8")}>
          {Array.from({ length: itemCount }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "flex animate-in fade-in duration-500",
                variant === "feed" ? "gap-x-5" : "flex-col gap-y-4"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-x-4">
                <Skeleton className={cn(
                  "shrink-0 rounded-full",
                  variant === "feed" ? "h-12 w-12" : "h-11 w-11"
                )} />
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                    {variant === "feed" && <Skeleton className="h-3 w-12 rounded-md" />}
                  </div>
                  <Skeleton className="h-3.5 w-1/4 rounded-md opacity-60" />
                </div>
              </div>
              {variant === "list" && (
                <Skeleton className="h-2 w-full rounded-full opacity-40" />
              )}

              {variant === "feed" && (
                <div className="ml-17 space-y-2">
                   <Skeleton className="h-4 w-full rounded-md" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {variant === "card" && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <Skeleton className="h-75 w-full rounded-[2rem]" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
