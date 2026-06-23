'use client'

import * as React from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { ColumnDef } from '@tanstack/react-table'

import { cn, getCurrentPeriod, groupPeriodsByMonth } from '@/lib'
import { layouts, patterns, tokens } from '@/lib/styles'

import { useTeamKPI } from '@/hooks'
import { TeamMemberKPI } from '@/types/features'

import { 
  Typography, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  Table,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button
} from '@/components/atoms'
import { Check, ChevronDown } from 'lucide-react'

import { SummaryCard } from './team-kpi/summary-card'
import { TeamKpiSkeleton } from './team-kpi/team-kpi-skeleton'
import { getRecentPeriods, getPeriodDateRange } from '@/lib'

export interface TeamKpiTableProps {
  projectId: Id<"projects">
  className?: string
}

export const TeamKpiTable = ({
  projectId,
  className
}: TeamKpiTableProps) => {
  const currentPeriod = React.useMemo(() => getCurrentPeriod(), [])
  const recentPeriods = React.useMemo(() => getRecentPeriods(), []) 
  const groupedPeriods = React.useMemo(() => groupPeriodsByMonth(recentPeriods), [recentPeriods])
  const [selectedPeriod, setSelectedPeriod] = React.useState(currentPeriod)

  const dateRange = React.useMemo(() => getPeriodDateRange(selectedPeriod), [selectedPeriod])

  const {
    data: sortedData,
    isLoading,
    teamTotalPoints,
    teamTotalTasks,
    teamTotalBonus,
    teamTotalPenalties
  } = useTeamKPI(projectId, dateRange.from, dateRange.to)

  const columns = React.useMemo<ColumnDef<TeamMemberKPI>[]>(() => [
    {
      id: 'rank',
      header: '#',
      meta: {
        headerClassName: 'w-[100px] text-center pl-10',
        className: 'w-[100px] text-center pl-10'
      },
      cell: ({ row }) => (
        <Typography className={cn(
          "text-sm",
          row.index === 0 ? "font-black text-amber-500" : "font-bold text-muted-foreground/30"
        )}>
          {row.index + 1}
        </Typography>
      )
    },
    {
      accessorKey: 'fullName',
      header: 'Team Member',
      meta: {
        headerClassName: 'min-w-[220px]'
      },
      cell: ({ row }) => {
        const member = row.original
        const initials = member.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className={cn(tokens.size.avatarMd, patterns.avatarSubtle)}>
              <AvatarImage src={member.imageUrl} />
              <AvatarFallback className={cn(
                tokens.surface.neutral,
                "text-muted-foreground/40",
                tokens.fontSize.xs,
                tokens.fontWeight.bold
              )}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Typography className="font-bold text-sm tracking-tight">{member.fullName}</Typography>
                {row.index === 0 && <span className="text-[10px]"></span>}
              </div>
              <div className="flex items-center gap-2">
                <Typography className={patterns.textLabel}>{member.role}</Typography>
                {row.index === 0 && (
                  <Typography className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    tokens.color.warning
                  )}>
                    Top contributor
                  </Typography>
                )}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'completionProgress',
      header: 'Progress',
      meta: {
        headerClassName: 'w-[180px]'
      },
      cell: ({ row }) => {
        const progressValue = row.original.completionProgress || 0
        return (
          <div className="flex items-center gap-3 pr-4">
            <div className={cn("flex-1 h-1.5 bg-muted/50 overflow-hidden", tokens.radius.full)}>
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  row.index === 0 ? "bg-emerald-500" : 
                  row.index === 1 ? "bg-blue-500" : "bg-amber-500"
                )}
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <Typography className={cn(
              "text-[10px] font-black text-muted-foreground/50 w-8"
            )}>
              {Math.round(progressValue)}%
            </Typography>
          </div>
        )
      }
    },
    {
      header: 'Tasks',
      meta: {
        headerClassName: 'w-[100px] text-center',
        className: 'text-center'
      },
      cell: ({ row }) => (
        <Typography className="text-sm font-bold text-foreground/80">
          {row.original.metrics.tasksCompleted}
        </Typography>
      )
    },
    {
      header: 'Bonus',
      meta: {
        headerClassName: 'w-[100px] text-center',
        className: 'text-center'
      },
      cell: ({ row }) => {
        const totalBonus = row.original.metrics.earlyCompletions + row.original.metrics.efficiencyBonuses
        return (
          <Typography className={cn("text-sm font-bold", tokens.color.success)}>
            +{totalBonus}
          </Typography>
        )
      }
    },
    {
      header: 'Penalty',
      meta: {
        headerClassName: 'w-[100px] text-center',
        className: 'text-center'
      },
      cell: ({ row }) => {
        const lateCompletions = row.original.metrics.lateCompletions
        return (
          <Typography className={cn(
            "text-sm font-bold",
            lateCompletions > 0 ? tokens.color.error : "text-muted-foreground/20"
          )}>
            {lateCompletions > 0 ? `-${lateCompletions}` : "—"}
          </Typography>
        )
      }
    },
    {
      accessorKey: 'totalScore',
      header: 'Points',
      meta: {
        headerClassName: 'w-[100px] text-center',
        className: 'text-center'
      },
      cell: ({ row }) => (
        <Typography className={cn(
          "font-black tracking-tight",
          row.index === 0 ? "text-foreground" : "text-foreground/80"
        )}>
          {row.original.totalScore}
        </Typography>
      )
    }
  ], [])

  if (isLoading) {
    return <TeamKpiSkeleton className={className} />
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className={layouts.flexBetween}>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="unstyled" 
              size="none"
              className={cn(
                "bg-muted/50 border border-border text-muted-foreground font-bold px-3 py-1 rounded-full shadow-sm hover:bg-muted/80 transition-all flex items-center gap-2 group text-[11px]"
              )}
            >
              {selectedPeriod}
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="end">
            <div className="flex flex-col">
              <Typography className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 border-b border-border/10 mb-1">
                Select Period
              </Typography>
              <div className="max-h-80 overflow-y-auto custom-scrollbar p-1 space-y-4">
                {Object.entries(groupedPeriods).map(([month, periods]) => (
                  <div key={month} className="space-y-1">
                    <Typography className="px-2 text-[9px] font-bold text-primary/50 uppercase tracking-tighter">
                      {month}
                    </Typography>
                    <div className="flex flex-col gap-0.5">
                      {periods.map((p) => (
                        <Button
                          key={p.label}
                          variant="unstyled"
                          size="none"
                          onClick={() => setSelectedPeriod(p.label)}
                          className={cn(
                            "flex items-center justify-between px-2 py-2 rounded-lg text-left transition-all hover:bg-primary/5 group/item w-full",
                            selectedPeriod === p.label ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div className="flex flex-col gap-0.5">
                            <Typography className="text-[11px] font-bold leading-none">
                              {p.label.split(' · ')[1]}
                            </Typography>
                            <Typography className={cn(
                              "text-[9px] font-medium opacity-40 group-hover/item:opacity-60 transition-opacity",
                              selectedPeriod === p.label && "opacity-60"
                            )}>
                              {p.dateRange}
                            </Typography>
                          </div>
                          {selectedPeriod === p.label && <Check className="h-3 w-3 shrink-0" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <SummaryCard 
          label="Total team points" 
          value={teamTotalPoints} 
          subLabel={`from ${sortedData.length} members`} 
          valueColor={tokens.color.success}
        />
        <SummaryCard 
          label="Tasks completed" 
          value={teamTotalTasks} 
          subLabel="this period" 
        />
        <SummaryCard 
          label="Total bonus" 
          value={`+${teamTotalBonus}`} 
          subLabel="extra performance" 
          valueColor={tokens.color.success}
        />
        <SummaryCard 
          label="Total penalties" 
          value={`-${teamTotalPenalties}`} 
          subLabel="requires attention" 
          valueColor={tokens.color.error}
        />
      </div>

      <div className="space-y-4">
        <Table 
          data={sortedData}
          columns={columns}
          className={cn(
            tokens.surface.glass,
            tokens.border.subtle,
            tokens.radius["2xl"],
            "overflow-hidden"
          )}
        />
      </div>
    </div>
  )
}