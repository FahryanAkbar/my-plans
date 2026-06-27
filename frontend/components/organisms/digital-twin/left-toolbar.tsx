"use client";

import React from "react";
import {
  Layers,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Button, Typography, Switch, Badge } from "@/components/atoms";

export interface LeftToolbarProps {
  isConnected: boolean;
  nodeCount: number;
  averageUptime: string;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  lowPowerMode: boolean;
  onLowPowerModeChange: (lowPower: boolean) => void;
  onResetCamera: () => void;
}

export function LeftToolbar({
  isConnected,
  nodeCount,
  averageUptime,
  showLabels,
  onShowLabelsChange,
  lowPowerMode,
  onLowPowerModeChange,
  onResetCamera,
}: LeftToolbarProps) {
  return (
    <div className="flex xl:flex-col gap-4 p-4 bg-muted/20 border-b xl:border-b-0 xl:border-r border-border/40 shrink-0 w-full xl:w-72 justify-between xl:justify-start">
      <div className="space-y-4 w-full">
        <div>
          <Typography
            variant="h6"
            className="text-sm font-bold flex items-center gap-2"
          >
            <Layers className="h-4.5 w-4.5 text-primary animate-pulse" />
            Digital Twin Virtualizer
          </Typography>
          <Typography
            variant="caption"
            className="text-xs text-muted-foreground/60"
          >
            Live WebGL status synchronizer.
          </Typography>
        </div>

        <div className="p-3.5 rounded-xl border border-border/30 bg-card/45 space-y-2.5">
          <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 block">
            Gateway Metadata
          </Typography>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground/70">Socket State:</span>
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="px-2 py-0 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1"
                >
                  <Wifi className="h-3 w-3" /> Live
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="px-2 py-0 border-destructive/20 text-destructive bg-destructive/5 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse"
                >
                  <WifiOff className="h-3 w-3" /> Offline
                </Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground/70">
                Topology Objects:
              </span>
              <span className="font-semibold text-foreground/90">
                {nodeCount} nodes
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground/70">Uptime Average:</span>
              <span className="font-bold text-foreground/90">
                {averageUptime}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-2 border-t border-border/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
              {showLabels ? (
                <Eye className="h-3.5 w-3.5 text-primary/70" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground/60" />
              )}
              Render Node Labels
            </span>
            <Switch
              checked={showLabels}
              onCheckedChange={onShowLabelsChange}
              id="label-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
              <Zap
                className={`h-3.5 w-3.5 ${!lowPowerMode ? "text-primary/70 animate-bounce" : "text-muted-foreground/60"}`}
              />
              Dynamic Particles
            </span>
            <Switch
              checked={!lowPowerMode}
              onCheckedChange={(val) => onLowPowerModeChange(!val)}
              id="power-switch"
            />
          </div>
        </div>
      </div>

      <div className="xl:mt-auto w-full pt-4 border-t border-border/20">
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs font-medium text-foreground hover:bg-muted gap-2"
          onClick={onResetCamera}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Camera
        </Button>
      </div>
    </div>
  );
}
