"use client";

import { cn } from "@/lib";
import { 
  Card, 
  Typography,
  Progress 
} from "@/components/atoms";

interface QuickStat {
  label: string;
  value: string | number;
  subValue?: string;
}

interface ProjectQuickStatsProps {
  stats: QuickStat[];
}

export const ProjectQuickStats = ({ stats }: ProjectQuickStatsProps) => {
  return (
    <Card className="border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 lg:divide-y-0 divide-border/40">
        {stats.map((stat) => {
          const labelLower = stat.label.toLowerCase();
          const isCompletion = labelLower === "completion";
          const isStatus = labelLower === "status";
          const progressValue = isCompletion ? parseFloat(String(stat.value)) : 0;
          const valueStr = String(stat.value);

          return (
            <div 
              key={stat.label} 
              className="p-6 flex flex-col gap-4 hover:bg-muted/5 transition-colors"
            >
              <Typography className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {stat.label}
              </Typography>
              
              <div className="flex flex-col gap-1.5 mt-auto">
                <div className={cn(
                  "flex items-baseline",
                  isCompletion ? "gap-2" : "flex-col gap-0.5"
                )}>
                  <Typography 
                    variant="h3" 
                    className={cn(
                      "font-bold tracking-tight text-foreground/90 leading-none",
                      isStatus && (valueStr.toLowerCase() === "completed" || valueStr.toLowerCase() === "done") && "text-emerald-500 dark:text-emerald-400/90"
                    )}
                  >
                    {stat.value}
                  </Typography>
                  {stat.subValue && (
                    <Typography variant="muted" className="text-[10px] font-medium opacity-70">
                      {stat.subValue}
                    </Typography>
                  )}
                </div>
                
                {isCompletion && (
                  <div className="mt-2">
                    <Progress 
                      value={progressValue} 
                      className="h-1.5" 
                      indicatorClassName="bg-emerald-500/80"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
