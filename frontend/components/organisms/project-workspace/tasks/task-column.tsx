"use client";

import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { cn, CreateTaskFormValues, TaskStatus } from "@/lib";
import { 
  TaskColumnHeader, 
  TaskColumnContent, 
  TaskCardProps, 
  TaskColumnSkeleton 
} from "@/components/organisms";

interface TaskColumnProps {
  projectId: Id<"projects">;
  id: TaskStatus;
  title: string;
  tasks: TaskCardProps[];
  onAddTask?: (status: TaskStatus) => void;
  onEdit?: (task: TaskCardProps) => void;
  onDelete?: (task: TaskCardProps) => void;
  onArchive?: (task: TaskCardProps) => void;
  onUnarchive?: (task: TaskCardProps) => void;
  onUpdate?: (id: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => void;
  onSelect?: (id: Id<"tasks">, checked: boolean) => void;
  onSelectAll?: (status: TaskStatus, checked: boolean) => void;
  selectedIds?: Set<Id<"tasks">>;
  isAllSelected?: boolean;
  selectedCount?: number;
  onBulkDelete?: (status: TaskStatus) => void;
  onBulkArchive?: (status: TaskStatus) => void;
  onBulkUnarchive?: (status: TaskStatus) => void;
  onBulkMove?: (status: TaskStatus, newStatus: TaskStatus) => void;
  onClick?: (taskId: Id<"tasks">) => void;
  className?: string;
}

export const TaskColumn = (taskColumn: TaskColumnProps) => {
  return (
    <div className={cn("flex flex-col w-80 shrink-0 group/column", taskColumn.className)}>
      <TaskColumnHeader 
        projectId={taskColumn.projectId}
        id={taskColumn.id}
        title={taskColumn.title}
        tasks={taskColumn.tasks}
        onAddTask={taskColumn.onAddTask}
        onSelectAll={taskColumn.onSelectAll}
        isAllSelected={taskColumn.isAllSelected}
        selectedCount={taskColumn.selectedCount}
        onBulkDelete={taskColumn.onBulkDelete}
        onBulkArchive={taskColumn.onBulkArchive}
        onBulkUnarchive={taskColumn.onBulkUnarchive}
        onBulkMove={taskColumn.onBulkMove}
        selectedIds={taskColumn.selectedIds}
      />
      <TaskColumnContent 
        projectId={taskColumn.projectId}
        id={taskColumn.id}
        tasks={taskColumn.tasks}
        onAddTask={taskColumn.onAddTask}
        onEdit={taskColumn.onEdit}
        onDelete={taskColumn.onDelete}
        onArchive={taskColumn.onArchive}
        onUnarchive={taskColumn.onUnarchive}
        onUpdate={taskColumn.onUpdate}
        onSelect={taskColumn.onSelect}
        selectedIds={taskColumn.selectedIds}
        onClick={taskColumn.onClick}
      />
    </div>
  );
};

TaskColumn.Skeleton = TaskColumnSkeleton;
