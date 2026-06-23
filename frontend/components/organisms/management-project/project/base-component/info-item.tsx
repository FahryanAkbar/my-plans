'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

import { 
  Typography,
  Button
} from '@/components/atoms'

interface InfoItemProps {
  title: string
  description?: string

  onActionClick?: () => void
  actionIcon?: React.ReactNode
  actionLabel?: string
  actionElement?: React.ReactNode

  className: string
  titleClassName?: string
  descriptionClassName?: string
}

export const InfoItem = ({
  title,
  description,

  onActionClick,
  actionIcon,
  actionLabel = 'Information',
  actionElement,

  className,
  titleClassName,
  descriptionClassName
}: InfoItemProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <Typography
          variant='h4'
          className={cn('font-semibold', titleClassName)}
        >
          {title}
        </Typography>

        {actionElement ? (
          actionElement
        ): onActionClick ? (
          <Button
            variant='link'
            size='sm'
            onClick={onActionClick}
            aria-label={actionLabel}
          >
            {actionIcon && actionIcon}
          </Button>
        ): null}
      </div>
      {description && (
        <Typography
          variant='muted'
          className={cn('text-muted-foreground', descriptionClassName)}
        >
          {description}
        </Typography>
      )}
    </div>
  )
}