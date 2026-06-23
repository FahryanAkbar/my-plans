'use client'

import { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib'
import { useActivityTracker } from '@/hooks'
import { Activity } from '@/types/features'

import { TooltipProvider } from '@/components/atoms'

import { ActivityHeatmap } from './activity-tracker/activity-heatmap'
import { ActivityTimeline } from './activity-tracker/activity-timeline'
import { ActivityTrackerSkeleton } from './activity-tracker/activity-skeleton'


export interface ActivityTrackerProps {
  projectId: Id<"projects">
  onActivityClick?: (activity: Activity) => void
  variant?: 'timeline' | 'heatmap'
  className?: string
}

export const ActivityTracker = ({
  projectId,
  onActivityClick,
  variant = 'timeline',
  className
}: ActivityTrackerProps) => {
  const {
    activities,
    activityStats,
    isLoading,
    selectedDate,
    setSelectedDate
  } = useActivityTracker(projectId);

  if (isLoading) {
    return <ActivityTrackerSkeleton className={className} />
  }

  return (
    <TooltipProvider>
      <div className={cn("w-full", className)}>
        {variant === 'heatmap' ? (
          <ActivityHeatmap 
            totalActivities={activities.length} 
            onDateSelect={(date) => setSelectedDate(date)}
            selectedDate={selectedDate}
            activityStats={activityStats}
          />
        ) : (
          <ActivityTimeline 
            activities={activities}
            selectedDate={selectedDate}
            onClearFilter={() => setSelectedDate(null)}
            onActivityClick={onActivityClick}
          />
        )}
      </div>
    </TooltipProvider>
  )
}