"use client";

import React from "react";
import {
  Activity,
  Info,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Cpu,
  Database,
  Globe,
  Radio,
  Server,
  Cloud,
  ShieldAlert,
} from "lucide-react";
import { NodeType, NetworkNode, TwinObject } from "@/types/features";
import { Button, Typography, Badge } from "@/components/atoms";

import { TelemetryLog } from "@/hooks";

export interface TelemetryHudProps {
  selectedNode: NetworkNode | null;
  selectedTwin: TwinObject | null;
  mockLogs: TelemetryLog[];
  onClearSelection: () => void;
}

export function TelemetryHud({
  selectedNode,
  selectedTwin,
  mockLogs,
  onClearSelection,
}: TelemetryHudProps) {
  const getLucideIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.SERVICE:
        return <Cpu className="h-4 w-4" />;
      case NodeType.DATABASE:
        return <Database className="h-4 w-4" />;
      case NodeType.CDN:
        return <Radio className="h-4 w-4" />;
      case NodeType.GATEWAY:
        return <Server className="h-4 w-4" />;
      case NodeType.EXTERNAL:
        return <Cloud className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 bg-muted/10 border-t xl:border-t-0 xl:border-l border-border/40 shrink-0 w-full xl:w-80 flex flex-col gap-4 overflow-y-auto">
      <Typography
        variant="h6"
        className="text-sm font-bold border-b border-border/20 pb-2"
      >
        Twin Telemetry HUD
      </Typography>

      {selectedNode ? (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-card flex items-center gap-1 text-foreground/80 border-border/30"
            >
              {getLucideIcon(selectedNode.nodeType)}
              {selectedNode.nodeType}
            </Badge>
            {selectedTwin && (
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border-none ${
                  selectedTwin.status === "up"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : selectedTwin.status === "degraded"
                      ? "bg-amber-500/10 text-amber-500"
                      : selectedTwin.status === "down"
                        ? "bg-red-500/10 text-red-500 animate-pulse"
                        : "bg-slate-500/10 text-slate-500"
                }`}
              >
                {selectedTwin.status}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Infrastructure Info
            </Typography>
            <div className="space-y-1.5 bg-card border border-border/50 shadow-xs rounded-xl p-3.5 text-xs text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node Name:</span>
                <span className="font-semibold text-foreground">{selectedNode.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database ID:</span>
                <span className="font-mono text-[10px] text-foreground/90 select-all">
                  {selectedNode.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mapped Config:</span>
                <span className="font-medium text-foreground">
                  {selectedNode.configId ? "Connected Config" : "Not Mapped"}
                </span>
              </div>
            </div>
          </div>

          {selectedNode.configId ? (
            selectedTwin ? (
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Live Telemetry Metrics
                  </Typography>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-card border border-border/40 shadow-xs rounded-xl space-y-1">
                      <span className="text-muted-foreground text-[10px] block">
                        Health Score:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Activity
                          className={`h-4 w-4 ${
                            selectedTwin.twinHealth > 85
                              ? "text-emerald-600 dark:text-emerald-400"
                              : selectedTwin.twinHealth > 60
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400 animate-pulse"
                          }`}
                        />
                        <span className="text-sm font-bold text-foreground">
                          {selectedTwin.twinHealth}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-card border border-border/40 shadow-xs rounded-xl space-y-1">
                      <span className="text-muted-foreground text-[10px] block">
                        Flow Trend:
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold">
                        {selectedTwin.trend === "stable" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-foreground capitalize">
                              {selectedTwin.trend}
                            </span>
                          </>
                        ) : selectedTwin.trend === "recovering" ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-foreground capitalize">
                              {selectedTwin.trend}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            <span className="text-xs text-destructive capitalize">
                              {selectedTwin.trend}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="bg-card border border-border/40 shadow-xs rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Live Response Latency:
                        </span>
                        <span className="font-bold text-foreground">
                          {selectedTwin.latencyMs} ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-border/20">
                        <span className="text-muted-foreground/85">
                          Avg Response Latency:
                        </span>
                        <span className="font-semibold text-foreground/80">
                          {selectedTwin.avgLatencyMs} ms
                        </span>
                      </div>
                    </div>

                    <div className="bg-card border border-border/40 shadow-xs rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Uptime Percent:
                        </span>
                        <span className="font-bold text-foreground">
                          {selectedTwin.uptimePercent.toFixed(3)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-border/20">
                        <span className="text-muted-foreground/85">
                          Outage Incidents:
                        </span>
                        <span className="font-bold text-destructive flex items-center gap-1">
                          {selectedTwin.downtimeIncidents > 0 && (
                            <ShieldAlert className="h-3 w-3" />
                          )}
                          {selectedTwin.downtimeIncidents} failures
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border/40 text-center space-y-2 my-auto">
                <Activity className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <Typography
                  variant="caption"
                  className="text-xs text-muted-foreground/60 block leading-relaxed"
                >
                  Mapped config target has not emitted telemetry data yet.
                  Waiting for WebSocket handshake payload...
                </Typography>
              </div>
            )
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-border/40 text-center space-y-2 my-auto">
              <Info className="h-6 w-6 text-primary/40 mx-auto" />
              <Typography
                variant="caption"
                className="text-xs text-muted-foreground/60 block leading-relaxed"
              >
                This node is an unmonitored internal infrastructure node. Match
                it to a Website Monitoring Config in the Topology editor to
                stream live socket metrics.
              </Typography>
            </div>
          )}

          <Button
            size="xs"
            variant="ghost"
            className="w-full text-center text-xs text-muted-foreground/70 hover:text-foreground mt-auto"
            onClick={onClearSelection}
          >
            Clear Inspector Selection
          </Button>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col h-full min-h-0">
          <div className="space-y-2">
            <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Network Gateway Logs
            </Typography>
            <div className="flex flex-col gap-1.5 max-h-80 xl:max-h-none overflow-y-auto pr-1">
              {mockLogs.length > 0 ? (
                mockLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 text-[10.5px] border-b border-border/30 pb-1.5 leading-relaxed font-mono"
                  >
                    <span className="text-muted-foreground/50 shrink-0">
                      [{log.time}]
                    </span>
                    <span
                      className={`flex-1 break-all ${
                        log.type === "error"
                          ? "text-red-400 font-bold"
                          : log.type === "warn"
                            ? "text-amber-400 font-medium"
                            : log.type === "info"
                              ? "text-blue-400"
                              : "text-emerald-400"
                      }`}
                    >
                      {log.msg}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[10.5px] text-muted-foreground/45 italic">
                  Listening for active gateway flow signals...
                </div>
              )}
            </div>
          </div>

          <div className="text-center py-6 text-xs text-muted-foreground/50 border-t border-border/25 mt-auto">
            <Info className="h-4.5 w-4.5 text-muted-foreground/40 mx-auto mb-1.5" />
            Click any 3D node element in the canvas viewport to inspect its live
            socket telemetry variables.
          </div>
        </div>
      )}
    </div>
  );
}
