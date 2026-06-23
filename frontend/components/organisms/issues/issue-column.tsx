"use client";

import React from "react";
import { Droppable } from "@hello-pangea/dnd";

import { cn } from "@/lib";
import { useIssueColumn, IssueWithDetails } from "@/hooks";
import { IssueColumnProps } from "@/types/features";

import { IssueCard } from "./issue-card";
import { IssueColumnHeader, IssueColumnEmpty } from "./issue-columns";


export const IssueColumn = (props: IssueColumnProps) => {
  const {
    id,
    title,
    color,
    issues,
    onAddClick,
    onIssueClick,
    onEdit,
    onDelete,
    onSelect,
    onSelectAll,
    selectedIds,
    isAllSelected,
    selectedCount,
    onBulkDelete,
    onBulkStatusUpdate,
    onBulkArchive,
    onUpdate
  } = useIssueColumn(props);

  return (
    <div className="flex flex-col w-80 shrink-0 group/column">
      <IssueColumnHeader 
        id={id}
        title={title}
        color={color}
        issues={issues}
        onAddClick={onAddClick}
        onSelectAll={onSelectAll}
        isAllSelected={isAllSelected}
        selectedCount={selectedCount}
        onBulkDelete={onBulkDelete}
        onBulkStatusUpdate={onBulkStatusUpdate}
        onBulkArchive={onBulkArchive}
      />

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-50 transition-colors rounded-[2.5rem] p-3",
              snapshot.isDraggingOver && "bg-primary/5 ring-4 ring-primary/5 ring-inset"
            )}
          >
            <div className="space-y-4">
              {issues.map((issue: IssueWithDetails, index: number) => (
                <IssueCard 
                  key={issue._id} 
                  issue={issue} 
                  index={index} 
                  isSelected={selectedIds?.has(issue._id)}
                  onSelect={(checked) => onSelect?.(issue._id, checked)}
                  onClick={onIssueClick}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
              {provided.placeholder}
              
              {issues.length === 0 && !snapshot.isDraggingOver && (
                <IssueColumnEmpty onAddClick={() => onAddClick?.(id)} />
              )}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
};
