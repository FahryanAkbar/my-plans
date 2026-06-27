"use client";

import React from "react";
import {
  Network,
  Plus,
  Link as LinkIcon,
  HelpCircle,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button, Typography, Switch } from "@/components/atoms";

export interface TopologyLeftSidebarProps {
  isTopologyLoading: boolean;
  nodeCount: number;
  edgeCount: number;
  isLocked: boolean;
  onLockChange: (locked: boolean) => void;
  onAddNodeClick: () => void;
  onAddLinkClick: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

export function TopologyLeftSidebar({
  isTopologyLoading,
  nodeCount,
  edgeCount,
  isLocked,
  onLockChange,
  onAddNodeClick,
  onAddLinkClick,
  zoomIn,
  zoomOut,
  resetView,
}: TopologyLeftSidebarProps) {
  return (
    <div className="flex xl:flex-col gap-3 p-4 bg-muted/20 border-b xl:border-b-0 xl:border-r border-border/40 shrink-0 w-full xl:w-72 justify-between xl:justify-start animate-in fade-in duration-300">
      <div className="space-y-4 w-full">
        <div>
          <Typography
            variant="h6"
            className="text-sm font-bold flex items-center gap-2"
          >
            <Network className="h-4.5 w-4.5 text-primary" />
            Infrastructure Topology
          </Typography>
          <Typography
            variant="caption"
            className="text-xs text-muted-foreground/60"
          >
            Interactive node dependency mapper.
          </Typography>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs text-foreground/80 hover:bg-muted"
            onClick={onAddNodeClick}
            disabled={isTopologyLoading}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Node
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs text-foreground/80 hover:bg-muted"
            onClick={onAddLinkClick}
            disabled={nodeCount < 2 || isTopologyLoading}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Add Link
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="hidden xl:block p-3.5 rounded-xl border border-border/30 bg-card/40 space-y-2">
          <Typography
            variant="caption"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 block"
          >
            Network Metadata
          </Typography>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block">
                Total Nodes:
              </span>
              <span className="font-semibold text-foreground/90">
                {nodeCount}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block">
                Dependencies:
              </span>
              <span className="font-semibold text-foreground/90">
                {edgeCount}
              </span>
            </div>
          </div>
        </div>

        {/* Guide Overlay */}
        <div className="hidden xl:block text-xs space-y-2 text-muted-foreground/80 p-3 rounded-lg bg-muted/40 border border-border/20">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            <HelpCircle className="h-3.5 w-3.5" /> Quick Guide
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>Drag nodes to move (Save coordinates).</li>
            <li>Hover connectors and click to link nodes.</li>
            <li>Click node/edge to manage properties.</li>
            <li>Simulate system outages in Node details.</li>
          </ul>
        </div>
      </div>

      {/* Action Controls & Layout locking */}
      <div className="xl:mt-auto space-y-3 w-full border-t border-border/20 pt-4 hidden xl:block">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
            {isLocked ? (
              <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-primary/70" />
            )}
            Lock Positions
          </span>
          <Switch
            checked={isLocked}
            onCheckedChange={onLockChange}
            id="lock-switch"
          />
        </div>

        <div className="flex justify-between items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={resetView}
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
