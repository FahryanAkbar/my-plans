'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

import { 
  Typography,
  StatusBadge,
  type StatusType
} from '@/components/atoms'

interface StatusWithLabelProps {
  label: string
  status: StatusType
  statusLabel?: string

  className?: string
  labelClassName?: string
  badgeClassName?: string
  
  direction?: 'horizontal' | 'vertical'
  showDot?: boolean
}

export const StatusWithLabel = ({
  label,
  status,
  statusLabel,
  
  className,
  labelClassName,
  badgeClassName,
  
  direction = 'horizontal',
  showDot = true
}: StatusWithLabelProps) => {
  return (
    <div className={cn(
      'flex gap-x-3 gap-y-1.5',
      direction === 'horizontal' ? 'items-center justify-between' : 'flex-col items-start',
      className
    )}>
      <Typography 
        variant="smallText" 
        className={cn('text-muted-foreground font-medium shrink-0', labelClassName)}
      >
        {label}
      </Typography>
      
      <StatusBadge 
        status={status} 
        label={statusLabel}
        className={cn('h-6 px-2.5 text-[11px]', badgeClassName)}
        showDot={showDot}
      />
    </div>
  )
}

