'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

import { Button } from '@/components/atoms'

export interface ActionItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  className?: string
  disabled?: boolean
  isLoading?: boolean
}

interface ActionButtonGroupProps {
  actions: ActionItem[]
  className?: string
  buttonClassName?: string
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
}

export const ActionButtonGroup = ({
  actions,
  className,
  buttonClassName,
  size = 'sm'
}: ActionButtonGroupProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {actions.map((action, index) => {
        const Icon = action.icon
        
        return (
          <Button
            key={`${action.label}-${index}`}
            variant={action.variant || 'outline'}
            size={size}
            onClick={(e) => {
              e.stopPropagation()
              action.onClick()
            }}
            disabled={action.disabled || action.isLoading}
            className={cn('shadow-sm font-semibold', buttonClassName, action.className)}
          >
            {Icon && <Icon className="mr-0.5" />}
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}