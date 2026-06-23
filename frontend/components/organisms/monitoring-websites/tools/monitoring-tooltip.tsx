"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/atoms";
import { NameType, ValueType, Payload } from "recharts/types/component/DefaultTooltipContent";

export interface MonitoringTooltipProps {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  type: "latency" | "uptime" | "comparison";
}

export function MonitoringTooltip({ active, payload, type }: MonitoringTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  if (!data) return null;

  if (type === "latency") {
    const formattedTime = new Date(data.timestamp).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const formattedDate = new Date(data.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const isUp = data.isUp !== false;
    const statusColor = isUp ? "bg-success" : "bg-danger";
    const statusLabel = isUp ? "Healthy" : "Down";

    return (
      <Card 
        className="rounded-xl border-border/60 bg-card/95 backdrop-blur-sm shadow-xl min-w-48 overflow-hidden"
        style={{ boxShadow: "0 8px 32px rgb(0 0 0 / 0.12)" }}
      >
        <CardContent className="p-3">
          <div className="flex flex-col gap-1.5 bg-transparent">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                {formattedDate} {formattedTime}
              </span>
              <div className="flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", statusColor)} />
                <span className="text-[10px] font-bold text-muted-foreground">
                  {statusLabel}
                </span>
              </div>
            </div>
            
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xs text-muted-foreground font-semibold">Latency</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-foreground">
                  {Math.round(data.latencyMs)}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  ms
                </span>
              </div>
            </div>
            {data.statusCode !== undefined && (
              <div className="flex items-center justify-between text-[10px] border-t border-border/40 pt-1.5 mt-1">
                <span className="text-muted-foreground font-medium">Status Code</span>
                <span className={cn("font-bold", isUp ? "text-success" : "text-danger")}>
                  {data.statusCode}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "uptime") {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const uptime = data.uptimePercentage;
    const isPerfect = uptime === 100;
    
    let statusColor = "bg-success";
    let statusLabel = "100% Uptime";

    if (!isPerfect) {
      if (uptime >= 99.9) {
        statusColor = "bg-success/80";
        statusLabel = "Excellent";
      } else if (uptime >= 99.0) {
        statusColor = "bg-warning";
        statusLabel = "Warning";
      } else {
        statusColor = "bg-danger";
        statusLabel = "Downtime";
      }
    }

    return (
      <Card 
        className="rounded-xl border-border/60 bg-card/95 backdrop-blur-sm shadow-xl min-w-48 overflow-hidden"
        style={{ boxShadow: "0 8px 32px rgb(0 0 0 / 0.12)" }}
      >
        <CardContent className="p-3">
          <div className="flex flex-col gap-1.5 bg-transparent">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                {formattedDate}
              </span>
              <div className="flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", statusColor)} />
                <span className="text-[10px] font-bold text-muted-foreground">
                  {statusLabel}
                </span>
              </div>
            </div>
            
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xs text-muted-foreground font-semibold">Uptime</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-foreground">
                  {uptime.toFixed(3)}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "comparison") {
    const formattedTime = new Date(data.timestamp).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formattedDate = new Date(data.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const realVal = data.latencyMs;
    const predVal = data.googleTtfb;
    const diff = predVal !== undefined ? Math.round(predVal - realVal) : null;

    return (
      <Card 
        className="rounded-xl border-border/60 bg-card/95 backdrop-blur-sm shadow-xl min-w-52 overflow-hidden"
        style={{ boxShadow: "0 8px 32px rgb(0 0 0 / 0.12)" }}
      >
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 bg-transparent">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              {formattedDate} - {formattedTime}
            </span>
            
            <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2 mt-1 bg-transparent">
              {/* Real Data */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-muted-foreground font-medium">Real Data</span>
                </div>
                <span className="text-xs font-bold text-foreground">
                  {Math.round(realVal)}ms
                </span>
              </div>

              {/* Predicted */}
              {predVal !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Predicted</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {Math.round(predVal)}ms
                  </span>
                </div>
              )}

              {/* Deviation */}
              {diff !== null && (
                <div className="flex items-center justify-between border-t border-dashed border-border/40 pt-1.5 mt-1 text-[10px] bg-transparent">
                  <span className="text-muted-foreground font-medium">Deviation</span>
                  <span className={cn("font-bold", diff > 0 ? "text-primary" : "text-success")}>
                    {diff > 0 ? `+${diff}ms` : `${diff}ms`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}