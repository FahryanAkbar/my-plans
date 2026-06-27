"use client";

import React from "react";
import {
  Trash2,
  Play,
  RotateCcw,
  X,
  Link as LinkIcon,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button, Typography, Badge } from "@/components/atoms";
import { NetworkNode, NetworkEdge, MonitoringConfig } from "@/types/features";

export interface TopologyInspectorProps {
  selectedNode: NetworkNode | null;
  selectedConfig: MonitoringConfig | undefined;
  selectedEdge: NetworkEdge | null;
  sourceNodeLabel: string;
  targetNodeLabel: string;
  connectingSourceLabel: string | undefined;
  isLocked: boolean;
  isSimulatingActive: boolean;
  isSimulationLoading: boolean;
  impactResult: ImpactResult | null;
  onCancelConnecting: () => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onEditNodeClick: () => void;
}

export interface ImpactedNodeInfo {
  nodeId: string;
  label: string;
  depth: number;
}

export interface ImpactResult {
  sourceNodeId: string;
  impactedNodes: ImpactedNodeInfo[];
}

export function TopologyInspector({
  selectedNode,
  selectedConfig,
  selectedEdge,
  sourceNodeLabel,
  targetNodeLabel,
  connectingSourceLabel,
  isSimulatingActive,
  isSimulationLoading,
  impactResult,
  onCancelConnecting,
  onDeleteNode,
  onDeleteEdge,
  onStartSimulation,
  onStopSimulation,
  onEditNodeClick,
}: TopologyInspectorProps) {
  return (
    <div className="p-4 bg-muted/10 border-t xl:border-t-0 xl:border-l border-border/40 shrink-0 w-full xl:w-80 flex flex-col gap-4 overflow-y-auto animate-in fade-in duration-300">
      <Typography
        variant="h6"
        className="text-sm font-bold border-b border-border/20 pb-2"
      >
        Inspector Detail
      </Typography>

      {/* Connecting Helper Status */}
      {connectingSourceLabel && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs text-primary-300">
          <span className="flex items-center gap-2 font-medium">
            <LinkIcon className="h-4 w-4 animate-pulse" />
            Source node: {connectingSourceLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onCancelConnecting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* CASE A: Node Selected */}
      {selectedNode ? (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            >
              {selectedNode.nodeType}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDeleteNode(selectedNode.id)}
              title="Delete Node"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Typography className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Node Properties
              </Typography>
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] h-6 px-2 text-primary hover:text-primary-dark font-medium border border-primary/25 rounded-md hover:bg-primary/5"
                onClick={onEditNodeClick}
              >
                Edit Properties
              </Button>
            </div>
            <div className="space-y-1 bg-card border border-border/20 rounded-xl p-3.5 text-xs text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Label:</span>
                <span className="font-semibold text-foreground/80">
                  {selectedNode.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-semibold text-foreground/80 capitalize">
                  {selectedNode.nodeType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordinates:</span>
                <span className="font-mono font-medium text-foreground/75">
                  X:{selectedNode.x}, Y:{selectedNode.y}
                </span>
              </div>
            </div>
          </div>

          {/* Monitoring config association */}
          <div className="space-y-2">
            <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
              Mapped Website Config
            </Typography>
            <div className="bg-card/40 border border-border/20 rounded-xl p-3.5 text-xs">
              {selectedNode.configId ? (
                selectedConfig ? (
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground/80 truncate block max-w-35">
                        {selectedConfig.name}
                      </span>
                      <span
                        className={
                          selectedConfig.enabled
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedConfig.enabled ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div
                      className="text-[11px] text-muted-foreground/60 truncate block"
                      title={selectedConfig.url}
                    >
                      {selectedConfig.url}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-muted-foreground/70 border-t border-border/10">
                      <span>Env: {selectedConfig.environment}</span>
                      <span>Timeout: {selectedConfig.timeout}ms</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground/50">
                    Config id {selectedNode.configId} not found
                  </span>
                )
              ) : (
                <div className="text-center py-2 space-y-2">
                  <span className="text-muted-foreground/50 text-[11px] block">
                    No website monitoring mapped.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* IMPACT SIMULATION SECTION */}
          <div className="mt-auto border-t border-border/20 pt-4 space-y-3">
            <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
              Failure Simulation (BFS)
            </Typography>

            {selectedNode.configId ? (
              <div className="space-y-2">
                <Typography
                  variant="caption"
                  className="text-[11px] text-muted-foreground/70 block leading-relaxed"
                >
                  Trigger a mock outage simulation to run a BFS algorithm
                  traversal. Identify downstream bottlenecks and dependent
                  system failure flows.
                </Typography>

                {isSimulatingActive ? (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-medium"
                    onClick={onStopSimulation}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Simulation
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 gap-2 font-semibold"
                    onClick={onStartSimulation}
                    disabled={isSimulationLoading}
                  >
                    <Play className="h-4 w-4" />
                    {isSimulationLoading ? "Loading..." : "Simulate Outage 🚨"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed border-border/40 text-center">
                <AlertTriangle className="h-4.5 w-4.5 text-warning mx-auto mb-1.5" />
                <Typography
                  variant="caption"
                  className="text-[10px] text-muted-foreground/70 block"
                >
                  Map this node to a monitoring configuration first in order to
                  enable outage simulations.
                </Typography>
              </div>
            )}
          </div>

          {/* Impact Result summary */}
          {isSimulatingActive && impactResult && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 space-y-2">
              <Typography className="text-[10px] font-bold uppercase tracking-wider text-red-400/80 block">
                Blast Radius: {impactResult.impactedNodes.length} affected
              </Typography>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-muted">
                {impactResult.impactedNodes.map(
                  (item: ImpactedNodeInfo, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[11px] border-b border-border/5 pb-1"
                    >
                      <span className="text-foreground/80 truncate max-w-37.5">
                        {item.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 border-amber-500/20 text-amber-500"
                      >
                        Depth: {item.depth}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      ) : selectedEdge ? (
        /* CASE B: Edge/Connection Selected */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border-primary/20 bg-primary/5"
            >
              Relation Connection
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDeleteEdge(selectedEdge.id)}
              title="Delete Connection"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
              Relation Properties
            </Typography>
            <div className="bg-card/40 border border-border/20 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source Node:</span>
                <span className="font-semibold text-foreground/80">
                  {sourceNodeLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Node:</span>
                <span className="font-semibold text-foreground/80">
                  {targetNodeLabel}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 mt-2">
                <span className="text-muted-foreground">Relation Type:</span>
                <Badge className="text-[9px] font-semibold tracking-wider">
                  {selectedEdge.relationType}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CASE C: Empty State (General Details) */
        <div className="text-center py-12 space-y-3 flex-1 flex flex-col justify-center">
          <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto text-muted-foreground/40">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <Typography className="text-xs font-bold text-foreground/70 block">
              No selection
            </Typography>
            <Typography
              variant="caption"
              className="text-[11px] text-muted-foreground/50 block px-6 leading-relaxed"
            >
              Click a node to configure settings, link monitoring websites, and
              simulate failure outages. Click connections to delete them.
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}
