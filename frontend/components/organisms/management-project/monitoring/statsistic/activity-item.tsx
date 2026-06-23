"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  Typography
} from "@/components/atoms"

export type ActivityUser = {
  name: string
  image?: string
}

export interface ActivityItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'content' | 'onClick'> {
  user: ActivityUser
  action: React.ReactNode
  target?: React.ReactNode
  content?: React.ReactNode
  time: React.ReactNode
  onClick?: () => void
}

export function getInitials(name: string) {
  if (!name) return ""
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const ActivityItem = React.forwardRef<HTMLElement, ActivityItemProps>(({
  user,
  action,
  target,
  content,
  time,
  className,
  onClick,
  ...props
}, ref) => {
  const isInteractive = !!onClick

  return (
    <article
      ref={ref}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 md:gap-4 p-3 rounded-lg transition-colors',
        isInteractive && 'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      <Avatar className="h-8 w-8 mt-1 md:h-9 md:w-9 shrink-0">
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback className="text-xs md:text-sm">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
          <Typography variant="p" className="text-sm m-0 leading-snug not-first:mt-0">
            <span className="font-medium text-foreground">{user.name}</span>{' '}
            <span className="text-muted-foreground">{action}</span>{' '}
            {target && (
              <span className="font-medium text-foreground">{target}</span>
            )}
          </Typography>
          <Typography variant="smallText" className="text-xs text-muted-foreground whitespace-nowrap font-normal shrink-0">
            {time}
          </Typography>
        </div>
        
        {content && (
          <div className="text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-md mt-0.5 border border-border/50 wrap-break-word">
            {content}
          </div>
        )}
      </div>
    </article>
  )
})
ActivityItem.displayName = "ActivityItem"
