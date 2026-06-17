"use client"

import { useMemo, useState } from "react"
import { ChevronUp } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  Button,
  Card,
  CardContent,
  Progress,
  Typography,
} from "@/components/atoms"

export type OverviewStatsProps = {
  projectId?: Id<"projects">
}

export const OverviewStats = ({ projectId }: OverviewStatsProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const projectStats = useQuery(
    api.projectStats.getByProject,
    projectId ? { projectId } : "skip"
  )
  const dashboardStats = useQuery(
    api.projectStats.getDashboard,
    projectId ? "skip" : {}
  )
  const stats = projectId ? projectStats : dashboardStats

  const totalTasks = stats?.totalTasks ?? 0
  const completedTasks = stats?.completedTasks ?? 0
  const inProgressTasks = stats?.inProgressTasks ?? 0
  const overdueTasks = stats?.overdueTasks ?? 0
  const completionRate = stats?.completionRate ?? 0
  const onTimeRate = stats?.onTimeCompletionRate ?? 0

  const inProgressRate = useMemo(() => {
    if (totalTasks === 0) return 0
    return Math.round((inProgressTasks / totalTasks) * 100)
  }, [inProgressTasks, totalTasks])

  const summaryItems = [
    {
      label: "Total tasks",
      value: `${totalTasks}`,
      hint: "All active",
      tone: "text-foreground",
    },
    {
      label: "Completed",
      value: `${completedTasks}`,
      hint: `${completionRate}% done`,
      tone: "text-emerald-400",
    },
    {
      label: "Overdue",
      value: `${overdueTasks}`,
      hint: overdueTasks > 0 ? "Needs attention" : "None",
      tone: overdueTasks > 0 ? "text-rose-400" : "text-foreground",
    },
    {
      label: "On-time rate",
      value: `${onTimeRate}%`,
      hint: "Deadline accuracy",
      tone: "text-amber-400",
    },
  ]

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/70 overflow-hidden">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border/60">
        <Typography variant="p" className="text-sm text-muted-foreground">
          Project Summary
        </Typography>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowBreakdown((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-2 text-sm font-semibold"
        >
          See breakdown
          <ChevronUp
            className={`h-4 w-4 transition-transform ${showBreakdown ? "" : "rotate-180"}`}
          />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/60">
        {summaryItems.map((item) => (
          <div key={item.label} className="p-4 md:p-5">
            <Typography variant="p" className="text-sm text-muted-foreground">
              {item.label}
            </Typography>
            <Typography variant="h3" className={`mt-1 ${item.tone}`}>
              {item.value}
            </Typography>
            <Typography variant="p" className="text-sm text-muted-foreground mt-1">
              {item.hint}
            </Typography>
          </div>
        ))}
      </div>

      {showBreakdown ? (
        <CardContent className="border-t border-border/60 px-4 md:px-5 py-5">
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="flex items-center gap-4 min-w-55">
              <div
                className="relative h-16 w-16 rounded-full"
                style={{
                  background: `conic-gradient(#34d399 ${completionRate}%, #2b3344 ${completionRate}% 100%)`,
                }}
              >
                <div className="absolute inset-1.5 rounded-full bg-card flex items-center justify-center text-center">
                  <div>
                    <Typography variant="h4" className="leading-none">
                      {completionRate}%
                    </Typography>
                    <Typography variant="p" className="text-[11px] text-muted-foreground leading-none mt-1">
                      rate
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <Typography variant="p" className="text-emerald-400">{completedTasks} completed</Typography>
                <Typography variant="p" className="text-muted-foreground">{inProgressTasks} in progress</Typography>
                <Typography variant="p" className="text-muted-foreground">{overdueTasks} overdue</Typography>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-[140px_1fr_48px] items-center gap-3">
                <Typography variant="p" className="text-muted-foreground">Completion rate</Typography>
                <Progress value={completionRate} />
                <Typography variant="p" className="text-right font-semibold">{completionRate}%</Typography>
              </div>

              <div className="grid grid-cols-[140px_1fr_48px] items-center gap-3">
                <Typography variant="p" className="text-muted-foreground">In progress</Typography>
                <Progress value={inProgressRate} />
                <Typography variant="p" className="text-right font-semibold">{inProgressRate}%</Typography>
              </div>

              <div className="grid grid-cols-[140px_1fr_48px] items-center gap-3">
                <Typography variant="p" className="text-muted-foreground">On-time delivery</Typography>
                <Progress value={onTimeRate} />
                <Typography variant="p" className="text-right font-semibold text-amber-400">{onTimeRate}%</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
