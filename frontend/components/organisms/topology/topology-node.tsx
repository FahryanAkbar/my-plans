"use client";

import React from "react";
import {
  Cpu,
  Database,
  Radio,
  Network,
  Cloud,
  Server,
  Globe,
  Plus,
} from "lucide-react";
import { Typography } from "@/components/atoms";
import { NodeType, NetworkNode, MonitoringConfig } from "@/types/features";

export interface TopologyNodeProps {
  node: NetworkNode;
  config: MonitoringConfig | undefined;
  isLocked: boolean;
  isSelected: boolean;
  isFailed: boolean;
  isImpacted: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onConnectingClick: () => void;
}

export function TopologyNode({
  node,
  config,
  isLocked,
  isSelected,
  isFailed,
  isImpacted,
  onMouseDown,
  onConnectingClick,
}: TopologyNodeProps) {
  const NODE_WIDTH = 190;
  const NODE_HEIGHT = 80;

  // Render node icon helper
  const getNodeIcon = (type: NodeType, sizeClass = "h-5 w-5") => {
    switch (type) {
      case NodeType.SERVICE:
        return <Cpu className={sizeClass} />;
      case NodeType.DATABASE:
        return <Database className={sizeClass} />;
      case NodeType.CDN:
        return <Radio className={sizeClass} />;
      case NodeType.GATEWAY:
        return <Network className={sizeClass} />;
      case NodeType.EXTERNAL:
        return <Cloud className={sizeClass} />;
      default:
        return <Server className={sizeClass} />;
    }
  };

  // Render type node custom CSS styling
  const getNodeBorderColor = () => {
    if (isFailed)
      return "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse";
    if (isImpacted)
      return "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.65)]";
    if (isSelected)
      return "border-primary shadow-[0_0_12px_rgba(67,97,238,0.4)]";

    switch (node.nodeType) {
      case NodeType.GATEWAY:
        return "border-sky-500/50 hover:border-sky-400";
      case NodeType.DATABASE:
        return "border-emerald-500/50 hover:border-emerald-400";
      case NodeType.CDN:
        return "border-purple-500/50 hover:border-purple-400";
      case NodeType.EXTERNAL:
        return "border-pink-500/50 hover:border-pink-400";
      default:
        return "border-neutral-500/50 hover:border-neutral-400";
    }
  };

  const getNodeBgColor = () => {
    if (isFailed) return "bg-red-500/10 backdrop-blur-md";
    if (isImpacted) return "bg-amber-500/10 backdrop-blur-md";

    switch (node.nodeType) {
      case NodeType.GATEWAY:
        return "bg-sky-500/5 backdrop-blur-md";
      case NodeType.DATABASE:
        return "bg-emerald-500/5 backdrop-blur-md";
      case NodeType.CDN:
        return "bg-purple-500/5 backdrop-blur-md";
      case NodeType.EXTERNAL:
        return "bg-pink-500/5 backdrop-blur-md";
      default:
        return "bg-card/90 backdrop-blur-md";
    }
  };

  const getNodeTextColor = () => {
    if (isFailed) return "text-red-400";
    if (isImpacted) return "text-amber-400";
    return "text-foreground";
  };

  return (
    <div
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
      }}
      className={`absolute z-10 p-3.5 border rounded-xl pointer-events-auto cursor-grab active:cursor-grabbing select-none flex flex-col justify-between transition-all duration-300 group ${getNodeBgColor()} ${getNodeBorderColor()}`}
      onMouseDown={onMouseDown}
    >
      {/* Node Top Row: Icon + Label */}
      <div className="flex items-start gap-2.5 min-w-0">
        <div
          className={`p-1.5 rounded-lg shrink-0 ${isFailed ? "bg-red-500/20 text-red-400" : isImpacted ? "bg-amber-500/20 text-amber-400" : isSelected ? "bg-primary/20 text-primary-300" : "bg-muted text-muted-foreground"}`}
        >
          {getNodeIcon(node.nodeType, "h-4 w-4")}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <Typography
            variant="span"
            className={`text-xs font-bold truncate block ${getNodeTextColor()}`}
          >
            {node.label}
          </Typography>
          <Typography
            variant="caption"
            className="text-[9px] font-semibold text-muted-foreground/60 block uppercase tracking-wider"
          >
            {node.nodeType}
          </Typography>
        </div>
      </div>

      {/* Node Bottom Row: Status Indicator / Config name */}
      <div className="flex items-center justify-between border-t border-border/20 pt-1.5 mt-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {config ? (
            <>
              <Globe className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              <span
                className="text-[10px] text-muted-foreground/60 truncate max-w-22.5"
                title={config.name}
              >
                {config.name}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground/40 italic">
              Not linked
            </span>
          )}
        </div>

        {/* Connected Target Status Badge */}
        {config ? (
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${isFailed ? "bg-red-500 animate-ping" : isImpacted ? "bg-amber-500" : config.enabled ? "bg-emerald-500" : "bg-neutral-500"}`}
            />
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              {isFailed
                ? "DOWN"
                : isImpacted
                  ? "IMPACT"
                  : config.enabled
                    ? "LIVE"
                    : "PAUSED"}
            </span>
          </div>
        ) : (
          <span className="h-2 w-2 rounded-full bg-neutral-600/40 shrink-0" />
        )}
      </div>

      {/* INTERACTIVE CONNECTOR BUTTONS */}
      {!isLocked && (
        <>
          <div
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 bg-muted hover:bg-primary border border-border rounded-full flex items-center justify-center cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity z-20"
            onClick={onConnectingClick}
            title="Link out dependency"
          >
            <Plus className="h-3 w-3 text-foreground" />
          </div>
        </>
      )}
    </div>
  );
}
