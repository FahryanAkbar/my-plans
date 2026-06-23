'use client'

import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  ArrowUp, 
  ArrowDown, 
  Info,
  Clock
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib'
import {
  Typography,
  StatusBadge,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/atoms'
import { ScoreHistoryItem } from '@/types/features'
import { tokens, patterns, surfaces } from '@/lib/styles'

const formatActionLabel = (reason: string) => {
  const customLabels: Record<string, string> = {
    task_completed: 'Completed',
    task_completed_early: 'Early Bird Bonus',
    task_completed_late: 'Late Completion',
    task_reverted: 'Task Reverted',
    efficiency_pro: 'Efficiency Pro',
    efficiency_lite: 'Efficiency Lite',
    task_reopened_revert: 'Reward Revoked',
    quality_penalty_reopened: 'Quality Penalty',
    low_effort_task_no_bonus: 'Low Effort (No Bonus)',
  }

  if (customLabels[reason]) return customLabels[reason]
  
  return reason
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getReasonBadgeTone = (reason: string) => {
  if (
    reason.includes('penalty') ||
    reason.includes('late') ||
    reason.includes('revert')
  ) {
    return "bg-rose-500/10 text-rose-600 border-rose-500/20"
  }

  if (
    reason.includes('efficiency') ||
    reason.includes('early') ||
    reason.includes('completed') ||
    reason.includes('resolved') ||
    reason.includes('bounty')
  ) {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  }

  return "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
}

export const getScoreHistoryColumns = (): ColumnDef<ScoreHistoryItem>[] => [
  {
    accessorKey: 'taskTitle',
    header: () => (
      <div className="flex items-center w-full pl-4 md:pl-10 min-w-50">
        <Typography className="font-bold text-sm text-foreground tracking-tight">Issue Created</Typography>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 pl-4 md:pl-10 w-full min-w-50">
        <Typography className="font-bold text-sm text-foreground line-clamp-1 tracking-tight">
          {row.original.taskTitle || "General Action"}
        </Typography>
        <Typography className="text-xs text-muted-foreground/70 line-clamp-1 italic font-medium leading-relaxed">
          {row.original.taskDescription || `System logged ${formatActionLabel(row.original.reason).toLowerCase()}`}
        </Typography>
      </div>
    )
  },
  {
    accessorKey: 'score',
    header: () => (
      <div className="flex justify-center items-center w-full min-w-25">
        <Typography className="font-bold text-sm text-foreground tracking-tight">Points</Typography>
      </div>
    ),
    cell: ({ row }) => {
      const score = row.original.score
      const isPositive = score > 0
      
      return (
        <div className="flex items-center justify-center w-full min-w-25">
          <div className={cn(
            "flex items-center justify-center h-7 px-3 font-black text-[11px] border transition-all duration-300",
            tokens.radius.md,
            isPositive 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.05)]" 
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-[0_2px_10px_rgba(244,63,94,0.05)]"
          )}>
            <span className="flex items-center font-black tracking-tight">
              {isPositive ? <ArrowUp className={cn(tokens.size.iconXs, "mr-1")} strokeWidth={3} /> : <ArrowDown className={cn(tokens.size.iconXs, "mr-1")} strokeWidth={3} />}
              {isPositive ? `+${score}` : score}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'reason',
    header: () => (
      <div className="flex justify-center items-center gap-1.5 w-full group/h min-w-35">
        <Typography className="font-bold text-sm text-foreground tracking-tight">Mechanism</Typography>
        <Popover>
          <PopoverTrigger asChild>
            <button className="cursor-pointer opacity-40 hover:opacity-100 focus:opacity-100 transition-opacity p-0.5 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-primary">
              <Info className={tokens.size.iconXs} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" className={cn("w-72 p-4", surfaces.overlay)} sideOffset={8} collisionPadding={16}>
            <div className="space-y-3">
              <Typography className={cn(patterns.textTinyCaps, "text-foreground tracking-widest mb-1")}>Scoring Mechanisms</Typography>
              <div className="flex flex-col gap-1">
                <Typography className={cn(patterns.textTinyCaps, "text-emerald-500 tracking-widest")}>Efficiency Pro/Lite</Typography>
                <Typography className="text-[10px] text-muted-foreground leading-relaxed">
                  Bonus for completing tasks faster than estimated (20% - 50% faster).
                </Typography>
              </div>
              <div className="flex flex-col gap-1 border-t border-border/50 pt-2">
                <Typography className={cn(patterns.textTinyCaps, "text-rose-500 tracking-widest")}>Quality &amp; Revocation</Typography>
                <Typography className="text-[10px] text-muted-foreground leading-relaxed">
                  Penalty or point removal when a task is reopened, reverted, or requires rework.
                </Typography>
              </div>
              <div className="flex flex-col gap-1 border-t border-border/50 pt-2">
                <Typography className={cn(patterns.textTinyCaps, "text-amber-500 tracking-widest")}>Ownership Audit</Typography>
                <Typography className="text-[10px] text-muted-foreground leading-relaxed">
                  System audit to prevent &ldquo;point farming&rdquo; on low-effort or trivial actions.
                </Typography>
              </div>
              <div className="flex flex-col gap-1 border-t border-border/50 pt-2">
                <Typography className={cn(patterns.textTinyCaps, "text-zinc-400 tracking-widest")}>Standard Completion</Typography>
                <Typography className="text-[10px] text-muted-foreground leading-relaxed">
                  Base points awarded for successfully finishing a task without bonuses.
                </Typography>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row }) => {
      const reason = row.original.reason
      const label = formatActionLabel(reason)
      let statusBadge: "Completed" | "In-Progress" | "Late" = "Completed"
      
      if (reason.includes('penalty') || reason.includes('late') || reason.includes('revert')) {
        statusBadge = "Late"
      } else if (reason.includes('reverted') || reason.includes('effort')) {
        statusBadge = "In-Progress"
      }

      return (
        <div className="flex justify-center items-center w-full min-w-35">
          <StatusBadge 
            status={statusBadge} 
            label={label}
            className={cn(
              "w-fit px-3.5 py-1.5 text-[11px] font-semibold tracking-normal border shadow-none whitespace-nowrap",
              tokens.radius.md,
              getReasonBadgeTone(reason)
            )}
            showDot
          />
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <div className="flex justify-end items-center w-full pr-4 md:pr-12 min-w-30">
        <Typography className="font-bold text-sm text-foreground tracking-tight">Timeline</Typography>
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <div className="flex justify-end items-center w-full pr-4 md:pr-12 min-w-30">
          <div className="flex items-center gap-2 text-muted-foreground/50 transition-all">
            <Clock className={cn(tokens.size.iconXs, "opacity-40 shrink-0")} />
            <Typography className={cn(patterns.textLabel, "whitespace-nowrap")}>
              {formatDistanceToNow(date, { addSuffix: true })}
            </Typography>
          </div>
        </div>
      )
    }
  }
]
