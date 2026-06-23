'use client'

import { cn } from '@/lib'
import { Typography, Card } from '@/components/atoms'

interface SummaryCardProps {
  label: string
  value: string | number
  subLabel: string
  valueColor?: string
}

export const SummaryCard = ({ 
  label, 
  value, 
  subLabel, 
  valueColor = "text-foreground" 
}: SummaryCardProps) => (
  <Card className="bg-card/40 border-border/50 p-5 rounded-2xl space-y-1 shadow-sm">
    <Typography className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">{label}</Typography>
    <div className="flex flex-col">
      <Typography className={cn("text-2xl font-black tracking-tighter", valueColor)}>{value}</Typography>
      <Typography className="text-[10px] font-medium text-muted-foreground/40 italic">{subLabel}</Typography>
    </div>
  </Card>
)
