import React from "react";
import { Skeleton } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface DailyLogEditorSkeletonProps {
  className?: string;
}

/**
 * Skeleton loading untuk area editor Daily Log.
 * Memberikan feedback visual berupa garis-garis teks dan blok konten yang sedang memuat.
 */
export const DailyLogEditorSkeleton = ({ className }: DailyLogEditorSkeletonProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <Skeleton className="h-4 w-full rounded-full bg-muted/40" />
      <Skeleton className="h-4 w-5/6 rounded-full bg-muted/40" />
      <Skeleton className="h-4 w-full rounded-full bg-muted/40" />
      <div className="pt-8 space-y-4">
         <Skeleton className="h-32 w-full rounded-3xl bg-muted/30" />
      </div>
      <Skeleton className="h-4 w-4/6 rounded-full bg-muted/40" />
      <Skeleton className="h-4 w-full rounded-full bg-muted/40" />
    </div>
  );
};
