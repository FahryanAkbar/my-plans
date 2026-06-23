"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import { ChartCard } from "@/components/organisms"
import { cn } from "@/lib"
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  YAxis,
  Cell,
} from "recharts"
import { Button, Typography } from "@/components/atoms"
import { OverviewChartTooltip } from "./overview-chart-tooltip"

export type ChartData = {
  name: string
  created: number
  completed: number
}

type Period = "daily" | "weekly" | "monthly"

const PERIOD_MAP: Record<string, Period> = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
}

const PERIOD_LABEL: Record<string, string> = {
  Daily: "today",
  Weekly: "this week",
  Monthly: "this month",
}

export type OverviewChartProps = {
  projectId?: Id<"projects">
  className?: string
}

type StatsFooterProps = {
  totalCreated: number
  totalCompleted: number
  completionRate: number
  periodLabel: string
}

const StatsFooter = ({ totalCreated, totalCompleted, completionRate, periodLabel }: StatsFooterProps) => (
  <div className="flex items-center justify-between sm:grid sm:grid-cols-3 gap-2 sm:gap-4 pt-4 pb-0 mb-5 border-t border-border shrink-0 px-1 sm:px-0">
    <div className="flex flex-col items-center justify-center space-y-0.5 flex-1">
      <Typography variant="p" className="text-[10px] sm:text-xs text-muted-foreground text-center">Total created</Typography>
      <Typography variant="p" className="text-xl sm:text-2xl font-bold text-blue-400 leading-tight">{totalCreated}</Typography>
      <Typography variant="p" className="text-[9px] sm:text-[10px] text-muted-foreground text-center">{periodLabel}</Typography>
    </div>
    <div className="flex flex-col items-center justify-center space-y-0.5 flex-1 border-l border-r border-border/50 px-2 sm:px-0 sm:border-none">
      <Typography variant="p" className="text-[10px] sm:text-xs text-muted-foreground text-center">Total completed</Typography>
      <Typography variant="p" className="text-xl sm:text-2xl font-bold text-green-400 leading-tight">{totalCompleted}</Typography>
      <Typography variant="p" className="text-[9px] sm:text-[10px] text-muted-foreground text-center">{periodLabel}</Typography>
    </div>
    <div className="flex flex-col items-center justify-center space-y-0.5 flex-1">
      <Typography variant="p" className="text-[10px] sm:text-xs text-muted-foreground text-center">Completion rate</Typography>
      <Typography variant="p" className={cn(
        "text-xl sm:text-2xl font-bold leading-tight",
        completionRate >= 70 ? "text-green-400" :
        completionRate >= 40 ? "text-amber-400" : "text-orange-400"
      )}>
        {completionRate}%
      </Typography>
      <Typography variant="p" className="text-[9px] sm:text-[10px] text-muted-foreground text-center">created vs done</Typography>
    </div>
  </div>
)

type PeriodControlProps = {
  active: string
  onChange: (p: string) => void
}

const PeriodControl = ({ active, onChange }: PeriodControlProps) => (
  <div className="relative flex items-center bg-muted/60 rounded-full p-0.5 gap-0.5 w-full sm:w-auto">
    {["Daily", "Weekly", "Monthly"].map((item) => (
      <Button
        key={item}
        variant="ghost"
        size="sm"
        onClick={() => onChange(item)}
        className={cn(
          "flex-1 sm:flex-none px-3.5 h-7 text-xs font-semibold rounded-full transition-all duration-200",
          active === item
            ? "bg-background text-foreground shadow-sm hover:bg-background"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        {item}
      </Button>
    ))}
  </div>
)

export const OverviewChart = ({
  projectId,
  className,
}: OverviewChartProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("Weekly")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const period = PERIOD_MAP[activeFilter] ?? "weekly"
  const periodLabel = PERIOD_LABEL[activeFilter] ?? "this week"

  const projectData = useQuery(
    api.analytics.getActivityStats,
    projectId ? { projectId, period } : "skip"
  )
  const globalData = useQuery(
    api.analytics.getUserActivityStats,
    projectId ? "skip" : { period }
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chartData = (projectId ? projectData : globalData) ?? []

  const stats = useMemo(() => {
    const totalCreated = chartData.reduce((s, d) => s + (d.created ?? 0), 0)
    const totalCompleted = chartData.reduce((s, d) => s + (d.completed ?? 0), 0)
    const completionRate = totalCreated > 0
      ? Math.round((totalCompleted / totalCreated) * 100)
      : 0
    return { totalCreated, totalCompleted, completionRate }
  }, [chartData])

  const lastIndex = chartData.length - 1

  return (
    <ChartCard
      title="Task Activity"
      className={cn("flex flex-col", className)}
      actions={<PeriodControl active={activeFilter} onChange={setActiveFilter} />}
      legend={
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-400/80" />
            <Typography variant="p" className="font-medium text-muted-foreground">Created</Typography>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-500/80" />
            <Typography variant="p" className="font-medium text-muted-foreground">Completed</Typography>
          </div>
        </div>
      }
    >
      <div className="h-75 min-h-0 w-full flex items-center justify-center">
        {!isMounted ? (
          <div className="h-full w-full bg-muted/5 animate-pulse rounded-lg" />
        ) : stats.totalCreated === 0 && stats.totalCompleted === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative h-52 w-52">
              <Image
                src="/empty-chart.svg"
                fill
                alt="No task activity"
                className="dark:hidden object-contain opacity-70 transition-opacity duration-300 hover:opacity-90"
                priority
              />
              <Image
                src="/empty-chart.svg"
                fill
                alt="No task activity"
                className="hidden dark:block object-contain opacity-35 transition-opacity duration-300 hover:opacity-50 mix-blend-screen"
                priority
              />
            </div>
            <Typography variant="muted" className="text-xs max-w-72 leading-relaxed">
              No task activity logged {periodLabel}. Try creating or finishing tasks to see your analytics.
            </Typography>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0} debounce={100}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            barCategoryGap="35%"
            barGap={3}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <XAxis
              dataKey="name"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af" }}
              ticks={
                activeFilter === "Daily"
                  ? ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"]
                  : undefined
              }
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: "#9ca3af" }}
              width={28}
            />
            <Tooltip
              content={<OverviewChartTooltip />}
              cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
            />

            <Bar dataKey="created" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {chartData.map((_, index) => (
                <Cell
                  key={`created-${index}`}
                  fill={index === lastIndex ? "#a5b4fc" : "#6366f1"}
                  fillOpacity={index === lastIndex ? 1 : 0.8}
                />
              ))}
            </Bar>

            <Bar dataKey="completed" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {chartData.map((_, index) => (
                <Cell
                  key={`completed-${index}`}
                  fill={index === lastIndex ? "#4ade80" : "#22c55e"}
                  fillOpacity={index === lastIndex ? 1 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!(stats.totalCreated === 0 && stats.totalCompleted === 0) && (
        <StatsFooter
          totalCreated={stats.totalCreated}
          totalCompleted={stats.totalCompleted}
          completionRate={stats.completionRate}
          periodLabel={periodLabel}
        />
      )}
    </ChartCard>
  )
}