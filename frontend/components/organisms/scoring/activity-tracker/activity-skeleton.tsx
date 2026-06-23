'use client'

import { Skeleton } from '@/components/atoms'
import { cn } from '@/lib'
import { tokens } from '@/lib/styles'

export const ActivityTrackerSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("px-0 space-y-8", className)}>
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 items-start relative pl-12">
        <Skeleton className={cn("absolute left-0 rounded-full", tokens.size.avatarMd)} />
        <div className={cn("flex-1 p-4 bg-muted/5 space-y-3", tokens.radius.xl)}>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
    ))}
  </div>
)
