import { Card, CardContent, Progress, Typography } from "@/components/atoms"

export interface OverviewChartTooltipProps {
  active?: boolean;
  payload?: {
    dataKey?: string;
    value?: number;
    color?: string;
  }[];
  label?: string;
}

export const OverviewChartTooltip = ({ active, payload, label }: OverviewChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  const created = payload.find((p) => p.dataKey === "created")?.value ?? 0
  const completed = payload.find((p) => p.dataKey === "completed")?.value ?? 0
  const total = created + completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Card 
      className="rounded-xl border-border/60 bg-background/95 backdrop-blur-sm shadow-xl min-w-40 overflow-hidden"
      style={{ boxShadow: "0 8px 32px rgb(0 0 0 / 0.12)" }}
    >
      <CardContent className="p-4">
        <Typography variant="p" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {label}
        </Typography>

        <div className="flex items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">Created</span>
          </div>
          <span className="text-xs font-bold text-blue-500">{created}</span>
        </div>

        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">Completed</span>
          </div>
          <span className="text-xs font-bold text-green-500">{completed}</span>
        </div>

        <div className="border-t border-border/50 pt-3">
          <Typography variant="p" className="text-[11px] text-muted-foreground font-medium mb-2.5">Completion rate</Typography>
          <div className="flex items-center gap-3">
            <Progress 
              value={completionRate} 
              className="flex-1 h-1.5" 
              indicatorClassName="bg-green-500" 
            />
            <span className="text-[11px] font-bold text-foreground tabular-nums w-8 text-right">
              {completionRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
