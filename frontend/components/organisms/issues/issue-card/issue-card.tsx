"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { IssueWithDetails } from "@/hooks";
import { cn, IssueSeverity } from "@/lib";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/atoms";

import { IssueCardHeader } from "./issue-card-header";
import { IssueCardContent } from "./issue-card-content";
import { IssueCardBadges } from "./issue-card-badges";
import { IssueCardFooter } from "./issue-card-footer";


export interface IssueCardProps {
  issue: IssueWithDetails;
  index: number;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: (id: string) => void;
  onEdit?: (issue: IssueWithDetails) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: Id<"issues">, updates: { title?: string; severity?: IssueSeverity; isArchived?: boolean }) => void;
}

export const IssueCard = ({ 
  issue, 
  index, 
  isSelected,
  onSelect,
  onClick, 
  onEdit, 
  onDelete,
  onUpdate
}: IssueCardProps) => {
  return (
    <Draggable draggableId={issue._id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(issue._id)}
          className={cn(
            "group relative p-4 mb-3 w-full min-h-40 flex flex-col justify-between bg-card border border-border/50 hover:border-primary/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl rounded-xl",
            snapshot.isDragging && "shadow-2xl ring-4 ring-primary/10 rotate-2 scale-[1.02] z-50 bg-accent",
            isSelected && "border-primary/40 bg-primary/5",
            issue.isArchived && "opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all"
          )}
        >
          <div className="space-y-3">
            <IssueCardHeader 
              issue={issue}
              isSelected={isSelected}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={(updates) => onUpdate?.(issue._id, updates)}
            />
            <IssueCardContent 
              issue={issue} 
              onUpdate={(updates) => onUpdate?.(issue._id, updates)}
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <IssueCardBadges 
              issue={issue} 
              onUpdate={(updates) => onUpdate?.(issue._id, updates)}
            />
            <IssueCardFooter issue={issue} />
          </div>
        </Card>
      )}
    </Draggable>
  );
};
