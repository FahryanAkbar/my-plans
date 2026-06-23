"use client"

import * as React from "react"

import { cn } from "@/lib"
import {
  PROJECT_PLATFORM,
  PROJECT_PLATFORM_BADGE_VARIANT,
  ProjectPlatform,
} from "@/lib"
import { Badge } from "@/components/atoms"

type PlatformBadgeProps = {
  platform?: string | null
  className?: string
}

const isProjectPlatform = (value: string): value is ProjectPlatform => {
  return Object.values(PROJECT_PLATFORM).includes(value as ProjectPlatform)
}

export const PlatformBadge = ({ platform, className }: PlatformBadgeProps) => {
  if (!platform || !isProjectPlatform(platform)) return null

  const config = PROJECT_PLATFORM_BADGE_VARIANT[platform]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "text-[10px] px-2 h-5 font-bold uppercase tracking-wider border-border/50",
        config.className,
        className
      )}
    >
      {platform}
    </Badge>
  )
}
