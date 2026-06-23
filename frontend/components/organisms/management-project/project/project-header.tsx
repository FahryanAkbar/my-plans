'use client'

import * as React from 'react'
import { cn } from '@/lib'

import { Typography, Button } from '@/components/atoms'

export type ProjectHeaderProps = {
  title: string
  description?: string
  actionLabel?: string
  onActionClick?: () => void
  tabs?: {
    label: string
    value: string
  }[]
  activeTab?: string
  onTabChange?: (value: string) => void
  rightSection?: React.ReactNode
  className?: string
}

export const ProjectHeader = ({
  title,
  description,

  actionLabel,
  onActionClick,

  tabs = [],
  activeTab,
  onTabChange,

  rightSection,

  className,
}: ProjectHeaderProps) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <Typography variant="h3" className="font-bold tracking-tight">
            {title}
          </Typography>

          {description && (
            <Typography variant="muted" className="text-sm mt-1">
              {description}
            </Typography>
          )}
        </div>

        {(actionLabel || rightSection) && (
          <div className="flex items-center gap-2">
            {rightSection}

            {actionLabel && (
              <Button 
                onClick={onActionClick}
                variant='default'
                size='default'
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {tabs.length > 0 && (
        <div className="flex items-center gap-2 border-b">
          {tabs.map((tab) => {
            const isActive = tab.value === activeTab

            return (
              <button
                key={tab.value}
                onClick={() => onTabChange?.(tab.value)}
                className={cn(
                  "px-3 py-2 text-sm transition border-b-2",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}