"use client";

import React from "react";
import { IssueWithDetails, useIssueBoard, CreateIssueValues } from "@/hooks";
import { BOARD_STATUS_ISSUE, IssueStatus } from "@/lib";

import { DragDropContext } from "@hello-pangea/dnd";
import { Id } from "@/convex/_generated/dataModel";

import { IssueColumn } from "./issue-column";
import { IssueBoardSkeleton } from "@/components/organisms";

interface IssueBoardProps {
  issues: IssueWithDetails[];
  isLoading?: boolean;
  onStatusChange: (issueId: Id<"issues">, status: IssueStatus) => Promise<void>;
  onAddIssue?: (status: IssueStatus) => void;
  onIssueClick?: (id: Id<"issues">) => void;
  onEdit?: (issue: IssueWithDetails) => void;
  onDelete?: (id: Id<"issues">) => void;
  onSelect?: (id: Id<"issues">, checked: boolean) => void;
  onSelectAll?: (status: IssueStatus, checked: boolean) => void;
  selectedIds?: Set<Id<"issues">>;
  selectedCount?: number;
  onBulkDelete?: (status: IssueStatus) => void;
  onBulkStatusUpdate?: (status: IssueStatus) => void;
  onBulkArchive?: (isArchived: boolean) => void;
  onUpdate?: (id: Id<"issues">, updates: Partial<CreateIssueValues>) => void;
}

export const IssueBoard = ({
  issues,
  isLoading = false,
  onStatusChange,
  onAddIssue,
  onIssueClick,
  onEdit,
  onDelete,
  onSelect,
  onSelectAll,
  selectedIds,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkArchive,
  onUpdate
}: IssueBoardProps) => {
  const { isMounted, handleDragEnd } = useIssueBoard({ onStatusChange });

  if (!isMounted) return null;

  if (isLoading) {
    return <IssueBoardSkeleton />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-x-6 overflow-x-auto pb-10 min-h-[calc(100vh-250px)] scrollbar-hide">
        {Object.values(BOARD_STATUS_ISSUE).map((column) => {
          const columnIssues = issues.filter((issue) => issue.status === column.id);
          const isAllSelected = columnIssues.length > 0 && columnIssues.every(i => selectedIds?.has(i._id));
          const selectedCount = columnIssues.filter(i => selectedIds?.has(i._id)).length;

          return (
            <IssueColumn
              key={column.id}
              id={column.id as IssueStatus}
              title={column.label}
              color={column.color}
              issues={columnIssues}
              onAddClick={() => onAddIssue?.(column.id as IssueStatus)}
              onIssueClick={(id) => onIssueClick?.(id as Id<"issues">)}
              onEdit={onEdit}
              onDelete={(id) => onDelete?.(id as Id<"issues">)}
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              selectedIds={selectedIds}
              isAllSelected={isAllSelected}
              selectedCount={selectedCount}
              onBulkDelete={onBulkDelete}
              onBulkStatusUpdate={onBulkStatusUpdate}
              onBulkArchive={onBulkArchive}
              onUpdate={onUpdate}
            />
          );
        })}
        <div className="w-1 shrink-0" />
      </div>
    </DragDropContext>
  );
};
