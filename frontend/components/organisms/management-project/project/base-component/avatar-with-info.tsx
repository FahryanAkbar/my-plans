'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

import { 
  Avatar,
  AvatarImage,
  AvatarFallback,
  Typography,
} from '@/components/atoms'

interface AvatarWithInfoProps {
  fullName: string
  imageUrl?: string
  
  subtitle?: string
  onClick?: () => void
  className?: string
  textClassName?: string

  rightElement?: React.ReactNode
  leftElement?: React.ReactNode
}

export const AvatarWithInfo = ({
  fullName,
  imageUrl,

  subtitle,
  onClick,

  className,
  textClassName,

  rightElement,
  leftElement
}: AvatarWithInfoProps) => {
  const fallback = React.useMemo(() => {
    if (!fullName) return '?'
    return fullName
      .split(' ')
      .map((name) => name[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [fullName])

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={cn(
        'flex items-center gap-3 w-full',
        onClick && 'cursor-pointer hover:opacity-80 transition',
        className
      )}
    >
      {leftElement && (
        <div className="flex shrink-0">
          {leftElement}
        </div>
      )}

      <Avatar className="shrink-0">
        <AvatarImage src={imageUrl} alt={fullName} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col min-w-0 flex-1', textClassName)}>
        <Typography variant="h6" className="font-medium truncate leading-none">
          {fullName}
        </Typography>

        {subtitle && (
          <Typography
            variant="smallText"
            className="text-muted-foreground truncate font-normal mt-0.5"
          >
            {subtitle}
          </Typography>
        )}
      </div>

      {rightElement && (
        <div className="ml-auto flex shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  )
}