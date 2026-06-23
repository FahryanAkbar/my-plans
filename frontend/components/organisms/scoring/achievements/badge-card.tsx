'use client'

import { ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/lib'
import { Typography } from '@/components/atoms'
import { tokens } from '@/lib/styles'

interface BadgeCardProps {
  badge: {
    id: number
    name: string
    description: string
    unlocked: boolean
  }
}

export const BadgeCard = ({ badge }: BadgeCardProps) => {
  return (
    <div 
      className={cn(
        "group flex items-start gap-4 p-4 transition-all duration-300",
        tokens.radius.xl,
        tokens.border.subtle,
        badge.unlocked 
          ? "bg-primary/5 border-primary/20 shadow-sm" 
          : "bg-muted/5 opacity-60"
      )}
    >
      <div className={cn(
        tokens.size.actionLg,
        "shrink-0 rounded-lg flex items-center justify-center transition-colors",
        badge.unlocked ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted-foreground/30"
      )}>
        {badge.unlocked ? <ChevronRight className={tokens.size.iconLg} /> : <Lock className={tokens.size.iconMd} />}
      </div>
      <div className="flex flex-col gap-0.5">
        <Typography className={cn(
          tokens.fontSize.base,
          tokens.fontWeight.bold,
          "tracking-tight",
          badge.unlocked ? "text-foreground" : "text-muted-foreground/60"
        )}>
          {badge.name.charAt(0) + badge.name.slice(1).toLowerCase().replace('_', ' ')}
        </Typography>
        <Typography className={cn(
          "text-[11px] font-medium text-muted-foreground/60 leading-tight"
        )}>
          {badge.description}
        </Typography>
        <div className="mt-2 pt-2 border-t border-border/10">
           <Typography className="text-[10px] font-medium text-muted-foreground/40">
            {badge.unlocked ? "Unlocked" : `0 / ${badge.description.match(/\d+/)?.[0] || 'X'} points`}
          </Typography>
        </div>
      </div>
    </div>
  )
}
