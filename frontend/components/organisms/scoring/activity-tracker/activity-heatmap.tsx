'use client'

import * as React from 'react'
import { format, addDays, startOfYear } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Typography,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/atoms'
import { tokens, patterns, layouts, surfaces } from '@/lib/styles'

interface ActivityHeatmapProps {
  totalActivities?: number
  onDateSelect?: (date: string | null) => void
  selectedDate?: string | null
  activityStats?: Record<string, { count: number, samples: string[] }>
}

export const ActivityHeatmap = ({ 
  totalActivities = 0, 
  onDateSelect, 
  selectedDate,
  activityStats = {}
}: ActivityHeatmapProps) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weeksPerMonth = 4
  const days = 7

  const [mounted, setMounted] = React.useState(false)
  const [hoveredDate, setHoveredDate] = React.useState<{ date: Date, count: number } | null>(null)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("h-40 w-full bg-muted/10 animate-pulse", tokens.radius.xl)} />
    )
  }
  
  const currentYear = new Date().getFullYear()
  const yearStart = startOfYear(new Date())

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
        <div className="flex min-w-max px-2">
          {months.map((month, idx) => (
            <div 
              key={month} 
              className={cn(
                "flex flex-col gap-4 px-6 first:pl-2 last:pr-2 group transition-colors",
                idx !== 0 && "border-l border-border/40"
              )}
            >
              <div className="flex items-center justify-center bg-muted/10 rounded-md py-1 mb-2">
                <span className={cn(patterns.textTinyCaps, "tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors")}>
                  {month}
                </span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: weeksPerMonth }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-2">
                    {Array.from({ length: days }).map((_, d) => {
                      const dayOfYear = (idx * weeksPerMonth * days) + (w * days) + d
                      const cellDate = addDays(yearStart, dayOfYear)
                      const dateStr = format(cellDate, 'yyyy-MM-dd')
                      const isSelected = selectedDate === dateStr
                      
                      const dayData = activityStats[dateStr]
                      const count = dayData?.count || 0
                      const samples = dayData?.samples || []

                      const level = count === 0 ? 0 :
                                   count <= 2 ? 1 :
                                   count <= 5 ? 2 :
                                   count <= 10 ? 3 : 4
                      
                      return (
                        <Tooltip key={d} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => onDateSelect?.(isSelected ? null : dateStr)}
                              onMouseEnter={() => setHoveredDate({ date: cellDate, count })}
                              onMouseLeave={() => setHoveredDate(null)}
                              className={cn(
                                "w-4 h-4 rounded-[3px] transition-all hover:scale-125 hover:z-10 cursor-pointer border border-transparent",
                                level === 0 && "bg-muted/10",
                                level === 1 && "bg-emerald-500/10",
                                level === 2 && "bg-emerald-500/25",
                                level === 3 && "bg-emerald-500/50",
                                level === 4 && "bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
                                isSelected && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background scale-110 z-20"
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className={cn("p-3 min-w-35", surfaces.overlay)}
                          >
                            <div className="flex flex-col gap-1">
                              <Typography className="text-[11px] font-black text-foreground leading-tight">
                                {format(cellDate, 'EEEE, d MMMM yyyy')}
                              </Typography>
                              <Typography className={cn(
                                patterns.textTinyCaps,
                                "tracking-widest mt-0.5",
                                count > 0 ? "text-emerald-500" : "text-muted-foreground/40"
                              )}>
                                {count} {count === 1 ? 'Activity' : 'Activities'}
                              </Typography>
                              
                              {samples.length > 0 && (
                                <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-border/50">
                                  {samples.map((sample, sIdx) => (
                                    <div key={sIdx} className="flex items-start gap-2 leading-tight">
                                      <div className="h-1 w-1 rounded-full bg-emerald-500/60 mt-1.5 shrink-0" />
                                      <Typography className="text-[10px] text-muted-foreground leading-snug">
                                        {sample}
                                      </Typography>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={cn("px-2 pt-4 border-t border-border/40", layouts.flexBetween)}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center min-h-6 transition-all duration-200">
            {hoveredDate ? (
              <Typography className="text-sm font-medium tracking-tight">
                <span>{format(hoveredDate.date, 'EEEE, d MMMM yyyy')}</span>
                <span className="text-muted-foreground/30 mx-2">—</span>
                <span className="text-foreground">{hoveredDate.count} {hoveredDate.count === 1 ? 'Activity' : 'Activities'}</span>
              </Typography>
            ) : (
              <Typography className={cn("text-sm tracking-tight", tokens.fontWeight.medium)}>
                Total {totalActivities.toLocaleString()} contribution activities in {currentYear}
              </Typography>
            )}
          </div>
        </div>

        <div className={cn(patterns.textTinyCaps, "flex items-center gap-3 text-muted-foreground font-bold tracking-widest")}>
          <span>Less</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((l) => (
              <div 
                key={l}
                className={cn(
                  "w-3 h-3 rounded-xs",
                  l === 0 && "bg-muted/10",
                  l === 1 && "bg-emerald-500/20",
                  l === 2 && "bg-emerald-500/40",
                  l === 3 && "bg-emerald-500/70",
                  l === 4 && "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.2)]"
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
