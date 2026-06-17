'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/atoms'

interface ScoreCardSkeletonProps {
  className?: string
}

export const ScoreCardSkeleton = ({ className }: ScoreCardSkeletonProps) => (
  <Card className={cn("h-32 w-full animate-pulse bg-muted/10 border-none shadow-none", className)} />
)
