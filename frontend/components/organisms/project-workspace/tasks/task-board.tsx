"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { 
  DragDropContext, 
  DropResult, 
} from "@hello-pangea/dnd";
import { 
  useReactTable, 
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import { TaskBoardSkeleton } from "@/components/organisms";
import { TaskColumn } from "./task-column";
import { TaskCardProps } from "./task-card";

import { 
  BOARD_STATUS_TASK, 
  TaskStatus, 
  CreateTaskFormValues 
} from "@/lib";

interface TaskBoardProps {
  projectId: Id<"projects">;
  data: TaskCardProps[];
  isLoading?: boolean;
  onTaskUpdate: (
    taskId: Id<"tasks">, 
    newStatus: TaskStatus, 
    newIndex: number,
    startDate?: number,
    dueDate?: number
  ) => Promise<void>;
  onAddTask?: (status: TaskStatus) => void;
  onEdit?: (task: TaskCardProps) => void;
  onDelete?: (task: TaskCardProps) => void;
  onArchive?: (task: TaskCardProps) => void;
  onUnarchive?: (task: TaskCardProps) => void;
  onUpdate?: (id: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => void;
  onSelect?: (id: Id<"tasks">, checked: boolean) => void;
  onSelectAll?: (status: TaskStatus, checked: boolean) => void;
  selectedIds?: Set<Id<"tasks">>;
  onBulkDelete?: (status: TaskStatus) => void;
  onBulkArchive?: (status: TaskStatus) => void;
  onBulkUnarchive?: (status: TaskStatus) => void;
  onBulkMove?: (status: TaskStatus, newStatus: TaskStatus) => void;
  onClick?: (taskId: Id<"tasks">) => void;
}

export const TaskBoard = ({
  projectId,
  data,
  isLoading = false,
  onTaskUpdate,
  onAddTask,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdate,
  onSelect,
  onSelectAll,
  selectedIds,
  onBulkDelete,
  onBulkArchive,
  onBulkUnarchive,
  onBulkMove,
  onClick
}: TaskBoardProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const columns = useMemo<ColumnDef<TaskCardProps>[]>(() => [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "status",
      header: "Status",
    }
  ], []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const newIndex = destination.index;

    if (onTaskUpdate) {
      await onTaskUpdate(draggableId as Id<"tasks">, newStatus, newIndex);
    }
  };

  if (!isMounted) return null;

  if (isLoading) {
    return <TaskBoardSkeleton />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-x-6 overflow-x-auto pb-10 min-h-[calc(100vh-250px)] scrollbar-hide">
        {Object.values(BOARD_STATUS_TASK).map((column) => {
          const columnTasks = table.getRowModel().rows
            .filter((row) => row.original.status === column.id)
            .map((row) => row.original);

          return (
            <TaskColumn
              key={column.id}
              projectId={projectId}
              id={column.id}
              title={column.label}
              tasks={columnTasks}
              onAddTask={() => onAddTask?.(column.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onUpdate={onUpdate}
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              selectedIds={selectedIds}
              isAllSelected={columnTasks.length > 0 && columnTasks.every(t => selectedIds?.has(t._id))}
              selectedCount={columnTasks.filter(t => selectedIds?.has(t._id)).length}
              onBulkDelete={onBulkDelete}
              onBulkArchive={onBulkArchive}
              onBulkUnarchive={onBulkUnarchive}
              onBulkMove={onBulkMove}
              onClick={onClick}
            />
          );
        })}
        
        <div className="w-1 shrink-0" />
      </div>
    </DragDropContext>
  );
};
