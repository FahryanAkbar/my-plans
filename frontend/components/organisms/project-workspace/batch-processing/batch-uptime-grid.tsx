"use client";

import React, { useMemo } from "react";
import { Clock } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Typography
} from "@/components/atoms";
import { format, subDays } from "date-fns";
import { MonitoringConfig, DailySummaryResponse } from "@/types/features";

interface BatchUptimeGridProps {
  configs: MonitoringConfig[];
  summaries: DailySummaryResponse[];
  isLoading: boolean;
  isConfigsLoading: boolean;
}

export function BatchUptimeGrid({ 
  configs, 
  summaries, 
  isLoading, 
  isConfigsLoading 
}: BatchUptimeGridProps) {
  // Generate past 30 days array for the contribution grid
  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, "yyyy-MM-dd");
    });
  }, []);

  const getGridColor = (uptime: number) => {
    if (uptime === 100) return "bg-emerald-500 hover:scale-125 transition-transform";
    if (uptime >= 99) return "bg-emerald-400/80 hover:scale-125 transition-transform";
    if (uptime >= 95) return "bg-amber-500 hover:scale-125 transition-transform";
    return "bg-red-500 hover:scale-125 transition-transform animate-pulse";
  };

  return (
    <Card className="border border-border/40 bg-card/25 shadow-sm p-6">
      <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-primary" />
            Uptime Calendar Grid (30 Days)
          </CardTitle>
          <CardDescription className="text-xs">
            Daily status grids mapped for each active monitoring website configuration.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground/75 bg-muted/50 dark:bg-slate-950/40 px-3 py-1.5 border border-border/30 dark:border-border/10 rounded-lg">
          <span>Worst</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400/80" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <span>Best</span>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        {isConfigsLoading || isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse bg-muted/20 rounded-lg border border-border/10" />
            ))}
          </div>
        ) : configs.length > 0 ? (
          <div className="divide-y divide-border/15 max-h-96 overflow-y-auto pr-1">
            {configs.map((config) => {
              // Find matching summaries for this config
              const configSummaries = summaries.filter((s) => s.configId === config.id);
              
              return (
                <div key={config.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Typography className="text-xs font-bold text-foreground truncate">{config.name}</Typography>
                    <Typography variant="caption" className="text-[10px] text-muted-foreground/60 truncate block hover:underline">
                      <a href={config.url} target="_blank" rel="noreferrer">{config.url}</a>
                    </Typography>
                  </div>

                  {/* 30-Day Contribution Grid */}
                  <div className="flex gap-1.5 shrink-0 overflow-x-auto py-1 no-scrollbar">
                    {last30Days.map((day) => {
                      const daySummary = configSummaries.find((s) => s.date === day);
                      const uptime = daySummary ? daySummary.uptimePercent : null;
                      const latency = daySummary ? daySummary.avgLatencyMs : null;

                      return (
                        <div 
                          key={day}
                          className={`group relative w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] font-mono cursor-default transition-all duration-200 border border-border/30 dark:border-white/5 ${
                            uptime !== null 
                              ? `${getGridColor(uptime)} text-white font-bold` 
                              : "bg-muted/40 dark:bg-slate-900 border-dashed border-border/40 text-muted-foreground/45 dark:text-muted-foreground/30"
                          }`}
                        >
                          <span>{day.substring(8)}</span>
                          
                          {/* Hover CSS Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-slate-950/95 border border-border/40 text-white rounded-xl text-[10px] whitespace-nowrap z-50 transition-opacity duration-200 pointer-events-none flex flex-col gap-1">
                            <span className="font-bold text-foreground">{format(new Date(day), "dd MMMM yyyy")}</span>
                            {uptime !== null ? (
                              <>
                                <span className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${uptime >= 99 ? "bg-emerald-400" : "bg-amber-400"}`} />
                                  Uptime: <strong className="text-foreground">{uptime.toFixed(2)}%</strong>
                                </span>
                                <span>Latency: <strong className="text-foreground">{Math.round(latency || 0)} ms</strong></span>
                                <span>Checks: {daySummary?.totalChecks}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground/60">No batch logs compiled</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground/60 border border-dashed border-border/30 rounded-xl">
            No configurations mapped. Add a target URL in the Monitoring tab to check aggregates.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
