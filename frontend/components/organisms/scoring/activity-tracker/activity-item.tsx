'use client'

import * as React from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  MessageSquare, 
  Activity as ActivityIcon,
  Clock,
  ExternalLink
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Typography,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/atoms'
import { AvatarWithInfo } from '@/components/organisms'
import { Activity, ActivityType } from '@/types/features'
import { tokens, patterns, layouts } from '@/lib/styles'

interface ActivityItemProps {
  activity: Activity
  onClick?: (activity: Activity) => void
}

const getActivityIcon = (type: ActivityType) => {
  const iconSize = tokens.size.iconMd;
  switch (type) {
    case 'create':
      return <Plus className={cn(iconSize, "text-blue-500")} />
    case 'update':
      return <Pencil className={cn(iconSize, "text-amber-500")} />
    case 'delete':
      return <Trash2 className={cn(iconSize, "text-rose-500")} />
    case 'comment':
      return <MessageSquare className={cn(iconSize, "text-emerald-500")} />
    case 'status':
      return <ActivityIcon className={cn(iconSize, "text-purple-500")} />
    default:
      return <Clock className={cn(iconSize, "text-muted-foreground")} />
  }
}

export const ActivityItem = ({ activity, onClick }: ActivityItemProps) => {
  return (
    <div 
      className={cn(
        "relative pl-12 pb-8 group transition-all duration-300",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(activity)}
    >
      {/* Timeline Dot & Icon */}
      <div className={patterns.timelineIcon}>
        {getActivityIcon(activity.type)}
      </div>

      <div className={cn(
        "flex flex-col gap-4 p-4 transition-colors border border-transparent group-hover:border-border/40",
        "bg-muted/5 group-hover:bg-muted/10",
        tokens.radius.xl
      )}>
        <div className={layouts.flexBetween}>
          <AvatarWithInfo
            fullName={activity.userName}
            imageUrl={activity.userImage}
            subtitle=""
            className="p-0 hover:bg-transparent h-auto"
          />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn(patterns.textTimestamp, "cursor-default whitespace-nowrap")}>
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">
              {format(activity.timestamp, 'PPP p')}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-1">
          <Typography className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground mr-1">{activity.userName}</span>
            {activity.action}
            {activity.targetName && (
              <span className="inline-flex items-center gap-1 ml-1.5 font-semibold text-primary/90 hover:text-primary hover:underline transition-all group/link">
                {activity.targetName}
                <ExternalLink className={cn(tokens.size.iconXs, "opacity-0 group-hover/link:opacity-100 transition-opacity")} />
              </span>
            )}
          </Typography>
        </div>
      </div>
    </div>
  )
}
