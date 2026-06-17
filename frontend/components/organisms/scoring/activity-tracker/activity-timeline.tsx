'use client'

import * as React from 'react'
import { format } from 'date-fns'

import { Typography } from '@/components/atoms'
import { EmptyItem } from '@/components/molecules'
import { ActivityItem } from './activity-item'
import { Activity } from '@/types/features'
import { cn } from '@/lib'
import { tokens, patterns, layouts } from '@/lib/styles'

interface ActivityTimelineProps {
  activities: Activity[]
  selectedDate: string | null
  onClearFilter: () => void
  onActivityClick?: (activity: Activity) => void
}

export const ActivityTimeline = ({
  activities,
  selectedDate,
  onClearFilter,
  onActivityClick
}: ActivityTimelineProps) => {
  return (
    <div className={cn("relative space-y-0", patterns.timelineLine)}>
      {selectedDate && (
        <div className={cn(
          "mb-8 p-4 border relative z-20",
          layouts.flexBetween,
          tokens.surface.info,
          tokens.radius.xl,
          tokens.border.info
        )}>
          <Typography className={cn(patterns.textTinyCaps, "text-primary tracking-widest font-bold")}>
            Showing activities for {format(new Date(selectedDate), 'PPPP')}
          </Typography>
          <button 
            onClick={onClearFilter}
            className={cn(
              patterns.textTinyCaps,
              "text-muted-foreground/60 hover:text-primary transition-colors tracking-widest font-black"
            )}
          >
            Clear Filter
          </button>
        </div>
      )}
      
      {activities.length > 0 ? (
        activities.map((activity) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            onClick={onActivityClick} 
          />
        ))
      ) : (
        <EmptyItem
          title="Silence is golden"
          description="No recent activities recorded for this project. New updates will be logged here."
          className={cn("py-16 relative z-20", patterns.emptyBox)}
        />
      )}
    </div>
  )
}
