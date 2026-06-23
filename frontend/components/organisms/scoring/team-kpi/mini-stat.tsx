'use client'

import { cn } from '@/lib'
import { Typography } from '@/components/atoms'

interface MiniStatProps {
  label: string
  value: string | number
  active?: boolean
  isPenalty?: boolean
}

export const MiniStat = ({ 
  label, 
  value, 
  active = false, 
  isPenalty = false 
}: MiniStatProps) => (
  <div className={cn(
    "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300",
    active && isPenalty ? "bg-rose-500/3" : "hover:bg-muted/30"
  )}>
    <Typography className={cn(
      "text-base font-bold tracking-tight leading-none mb-1",
      active && isPenalty ? "text-rose-500" : 
      active ? "text-foreground/90" : "text-muted-foreground/30"
    )}>
      {value}
    </Typography>
    <Typography className={cn(
      "text-[10px] font-bold uppercase tracking-widest leading-none",
      active && isPenalty ? "text-rose-500/40" : "text-muted-foreground/30"
    )}>
      {label}
    </Typography>
  </div>
)
