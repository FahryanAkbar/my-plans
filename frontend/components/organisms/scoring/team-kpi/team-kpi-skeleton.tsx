'use client'

import { cn } from '@/lib'
import { Skeleton } from '@/components/atoms'

interface TeamKpiSkeletonProps {
  className?: string
}

export const TeamKpiSkeleton = ({ className }: TeamKpiSkeletonProps) => (
  <div className={cn("space-y-8", className)}>
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-muted/10" />)}
    </div>
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-40 w-full rounded-3xl bg-muted/10" />
    ))}
  </div>
)
