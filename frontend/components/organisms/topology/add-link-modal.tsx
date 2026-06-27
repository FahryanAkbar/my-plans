"use client";

import React from "react";
import { Link as LinkIcon, X } from "lucide-react";
import {
  Button,
  Typography,
  NativeSelect,
  NativeSelectOption,
  Label,
} from "@/components/atoms";
import { RelationType, NetworkNode } from "@/types/features";

export interface AddLinkModalProps {
  show: boolean;
  newEdgeSourceId: string;
  onNewEdgeSourceIdChange: (id: string) => void;
  newEdgeTargetId: string;
  onNewEdgeTargetIdChange: (id: string) => void;
  newEdgeRelation: RelationType;
  onNewEdgeRelationChange: (relation: RelationType) => void;
  localNodes: NetworkNode[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddLinkModal({
  show,
  newEdgeSourceId,
  onNewEdgeSourceIdChange,
  newEdgeTargetId,
  onNewEdgeTargetIdChange,
  newEdgeRelation,
  onNewEdgeRelationChange,
  localNodes,
  onClose,
  onSubmit,
}: AddLinkModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center z-40 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-border/20 pb-3 mb-4">
          <Typography
            variant="h6"
            className="text-sm font-bold flex items-center gap-1.5"
          >
            <LinkIcon className="h-4 w-4 text-primary" />
            Add Connection Link
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                Source Node
              </Label>
              <NativeSelect
                value={newEdgeSourceId}
                onChange={(e) => onNewEdgeSourceIdChange(e.target.value)}
                className="w-full"
                size="sm"
              >
                <NativeSelectOption value="">
                  Select source...
                </NativeSelectOption>
                {localNodes.map((n) => (
                  <NativeSelectOption key={n.id} value={n.id}>
                    {n.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                Target Node (Dependency)
              </Label>
              <NativeSelect
                value={newEdgeTargetId}
                onChange={(e) => onNewEdgeTargetIdChange(e.target.value)}
                className="w-full"
                size="sm"
              >
                <NativeSelectOption value="">
                  Select target...
                </NativeSelectOption>
                {localNodes.map((n) => (
                  <NativeSelectOption key={n.id} value={n.id}>
                    {n.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
              Relation Type
            </Label>
            <NativeSelect
              value={newEdgeRelation}
              onChange={(e) =>
                onNewEdgeRelationChange(e.target.value as RelationType)
              }
              className="w-full"
              size="sm"
            >
              <NativeSelectOption value={RelationType.DEPENDS_ON}>
                DEPENDS_ON
              </NativeSelectOption>
              <NativeSelectOption value={RelationType.CALLS}>
                CALLS
              </NativeSelectOption>
              <NativeSelectOption value={RelationType.PROXIES_TO}>
                PROXIES_TO
              </NativeSelectOption>
            </NativeSelect>
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
              Connect Nodes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
