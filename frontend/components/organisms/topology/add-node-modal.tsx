"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import {
  Button,
  Typography,
  Input,
  NativeSelect,
  NativeSelectOption,
  Label,
} from "@/components/atoms";
import { NodeType, MonitoringConfig } from "@/types/features";

export interface AddNodeModalProps {
  show: boolean;
  newNodeName: string;
  onNewNodeNameChange: (name: string) => void;
  newNodeType: NodeType;
  onNewNodeTypeChange: (type: NodeType) => void;
  newNodeConfigId: string;
  onNewNodeConfigIdChange: (configId: string) => void;
  configs: MonitoringConfig[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddNodeModal({
  show,
  newNodeName,
  onNewNodeNameChange,
  newNodeType,
  onNewNodeTypeChange,
  newNodeConfigId,
  onNewNodeConfigIdChange,
  configs,
  onClose,
  onSubmit,
}: AddNodeModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-border/20 pb-3 mb-4">
          <Typography
            variant="h6"
            className="text-sm font-bold flex items-center gap-1.5"
          >
            <Plus className="h-4.5 w-4.5 text-primary" />
            Add Node Infrastructure
          </Typography>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
              Node Name / Label
            </Label>
            <Input
              type="text"
              placeholder="e.g. Auth Service, API Gateway..."
              value={newNodeName}
              onChange={(e) => onNewNodeNameChange(e.target.value)}
              className="w-full text-xs bg-muted/45 border-border/40 focus-visible:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                Infrastructure Type
              </Label>
              <NativeSelect
                value={newNodeType}
                onChange={(e) =>
                  onNewNodeTypeChange(e.target.value as NodeType)
                }
                className="w-full"
                size="sm"
              >
                <NativeSelectOption value={NodeType.SERVICE}>
                  Service
                </NativeSelectOption>
                <NativeSelectOption value={NodeType.DATABASE}>
                  Database
                </NativeSelectOption>
                <NativeSelectOption value={NodeType.CDN}>
                  CDN
                </NativeSelectOption>
                <NativeSelectOption value={NodeType.GATEWAY}>
                  Gateway
                </NativeSelectOption>
                <NativeSelectOption value={NodeType.EXTERNAL}>
                  External Endpoint
                </NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                Link Monitoring Config
              </Label>
              <NativeSelect
                value={newNodeConfigId}
                onChange={(e) => onNewNodeConfigIdChange(e.target.value)}
                className="w-full"
                size="sm"
              >
                <NativeSelectOption value="">
                  None (Unmonitored)
                </NativeSelectOption>
                {configs.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name} ({c.environment})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs text-white">
              Create Node
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
