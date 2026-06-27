'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/atoms'

interface ProjectFieldProps {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  valueClassName?: string
}

export const ProjectField = ({
  label,
  value,
  icon: Icon,
  className,
  valueClassName
}: ProjectFieldProps) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <Typography 
          variant="smallText" 
          className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]"
        >
          {label}
        </Typography>
      </div>
      
      <div className={cn("text-sm font-semibold truncate", valueClassName)}>
        {value || '-'}
      </div>
    </div>
  )
}
