"use client";

import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Droppable, DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

import { Typography, Button } from "@/components/atoms";
import { TaskCard, TaskCardProps } from "../task-card";
import { cn, CreateTaskFormValues, TaskStatus, patterns } from "@/lib";

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

export const TaskColumnContent = ({
  projectId,
  id,
  tasks,
  onAddTask,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdate,
  onSelect,
  selectedIds,
  onClick,
}: Pick<TaskColumnProps, 
  | "projectId" 
  | "id" 
  | "tasks" 
  | "onAddTask" 
  | "onEdit" 
  | "onDelete" 
  | "onArchive" 
  | "onUnarchive" 
  | "onUpdate" 
  | "onSelect" 
  | "selectedIds" 
  | "onClick">
) => {
  return (
    <Droppable droppableId={id}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn(
            "flex-1 min-h-37.5 transition-colors rounded-xl p-2",
            snapshot.isDraggingOver && "bg-primary/5 ring-2 ring-primary/5 ring-inset"
          )}
        >
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskCard 
                key={task._id} 
                {...task}
                projectId={projectId}
                index={index} 
                onEdit={() => onEdit?.(task)}
                onDelete={() => onDelete?.(task)}
                onArchive={() => onArchive?.(task)}
                onUnarchive={() => onUnarchive?.(task)}
                onUpdate={(updates) => onUpdate?.(task._id, updates)}
                isSelected={selectedIds?.has(task._id)}
                onSelect={(checked) => onSelect?.(task._id, checked)}
                onClick={() => onClick?.(task._id)}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <Button 
                variant="unstyled"
                size="none"
                onClick={() => onAddTask?.(id)}
                className={cn(patterns.emptyState, "hover:shadow-xl hover:shadow-primary/5")}
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={cn(patterns.iconBoxLarge, "mb-4")}>
                  <Plus className="h-5 w-5 text-muted-foreground/70 group-hover:text-primary group-hover:scale-125 group-hover:rotate-90 transition-all duration-700 ease-in-out" />
                </div>
                <Typography className={cn("relative z-10 text-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary/60 tracking-[0.2em]", patterns.textTinyCaps)}>
                  No tasks yet
                </Typography>
              </Button>
            )}
          </div>
        </div>
      )}
    </Droppable>
  );
};
