"use client";

import React from "react";
import { Skeleton } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface ProjectDetailSkeletonProps {
  className?: string;
}

export const ProjectDetailSkeleton = ({
  className,
}: ProjectDetailSkeletonProps) => {
  return (
    <div className={cn("w-full min-h-screen bg-background", className)}>
      <div className="h-14 border-b flex items-center px-4 md:px-8 gap-4">
         <Skeleton className="h-8 w-8 rounded-md" />
         <div className="flex items-center gap-2">
           <Skeleton className="h-4 w-20 rounded" />
           <span className="text-muted-foreground">/</span>
           <Skeleton className="h-4 w-32 rounded" />
         </div>
      </div>

      <div className="relative w-full h-[30vh] md:h-[35vh] lg:h-[40vh] bg-muted/30">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="px-4 md:px-8 -mt-12 relative z-10 pb-16">
        <div className="mx-auto w-full max-w-6xl space-y-10">
          
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-10 w-2/3 md:w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-full md:w-3/4 rounded-md opacity-60" />
                <Skeleton className="h-4 w-1/2 md:w-1/3 rounded-md opacity-40" />
              </div>
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>

          <div className="bg-card/50 p-1 rounded-xl border backdrop-blur-sm">
            <div className="flex items-center gap-1 p-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className={cn(
                    "h-9 rounded-lg",
                    i === 0 ? "w-24" : "w-20 opacity-50"
                  )} 
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded-md" />
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-card/50 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3 rounded" />
                          <Skeleton className="h-3 w-1/4 rounded opacity-50" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-2xl border bg-card/30 space-y-6">
                <Skeleton className="h-6 w-24 rounded-md" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-12 rounded opacity-50" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded-xl mt-4" />
              </div>
              
              <div className="p-6 rounded-2xl border bg-card/30 space-y-4">
                <Skeleton className="h-6 w-28 rounded-md" />
                <div className="flex -space-x-2">
                   {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded-full border-2 border-background" />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
