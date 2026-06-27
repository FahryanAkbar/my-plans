"use client";

import React from "react";
import { 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Database 
} from "lucide-react";
import { Card } from "@/components/atoms";

interface KPIs {
  avgUptime: number;
  avgLatency: number;
  totalIncidents: number;
  totalChecks: number;
}

interface BatchSummaryCardsProps {
  kpis: KPIs;
  isLoading: boolean;
}

export function BatchSummaryCards({ kpis, isLoading }: BatchSummaryCardsProps) {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
      {/* Uptime Card */}
      <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
            Avg Project Uptime
          </span>
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
          ) : (
            <div className="text-2xl font-bold font-mono text-success">
              {kpis.avgUptime.toFixed(3)}%
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <span>Target: &gt;99.9% uptime</span>
        </div>
      </Card>

      {/* Average Latency Card */}
      <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
            Avg Response Latency
          </span>
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
          ) : (
            <div className="text-2xl font-bold font-mono text-primary">
              {Math.round(kpis.avgLatency)} ms
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/20">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span>Weighted response time</span>
        </div>
      </Card>

      {/* Incident Count Card */}
      <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
            Total Downtime Incidents
          </span>
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
          ) : (
            <div className={`text-2xl font-bold font-mono ${kpis.totalIncidents > 0 ? "text-destructive" : "text-success"}`}>
              {kpis.totalIncidents}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/20">
          <AlertTriangle className={`h-3.5 w-3.5 ${kpis.totalIncidents > 0 ? "text-destructive" : "text-success"}`} />
          <span>30-day active incident count</span>
        </div>
      </Card>

      {/* Aggregated Checks Card */}
      <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
            Total Logs Processed
          </span>
          {isLoading ? (
            <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
          ) : (
            <div className="text-2xl font-bold font-mono text-muted-foreground/80">
              {kpis.totalChecks.toLocaleString("id-ID")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/20">
          <Database className="h-3.5 w-3.5 text-muted-foreground/80" />
          <span>Accumulated check logs</span>
        </div>
      </Card>
    </div>
  );
}
