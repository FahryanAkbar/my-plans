"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { 
  TaskType as TaskTypeEnum, 
  TaskStatus as TaskStatusEnum, 
  TaskPriority as TaskPriorityEnum,
} from "@/lib";
import { AvatarGroup } from "@/components/organisms";
import { Id } from "@/convex/_generated/dataModel";

import { useProjectPermission, useTaskTimeTracking } from "@/hooks";
import { cn, PERMISSIONS } from "@/lib";
import { CreateTaskFormValues } from "@/lib/schema";

import {
  TaskCardHeader,
  TaskCardTitle,
  TaskCardDates,
  TaskCardProgress,
  TaskCardFooter,
  TaskCardActions
} from "./cards";

export interface ProjectMember {
  userId: string;
  fullName: string;
  imageUrl?: string;
  role: string;
  position: string;
  joinedAt: number;
}

export interface TaskCardProps {
  _id: Id<"tasks">;
  index?: number;
  title: string;
  description?: string;
  priority: TaskPriorityEnum;
  status: TaskStatusEnum;
  type: TaskTypeEnum;
  assigneeId?: string;
  watchers?: string[];
  reporterId?: string;
  dueDate?: number;
  scoreValue?: number;
  startDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  lastStatusChangedAt?: number;
  commentsCount?: number;
  linksCount?: number;
  progress?: number; 
  projectId: Id<"projects">;
  createdAt: number;
  assigneeDetails?: { fullName: string; imageUrl?: string }[];
  watcherDetails?: { fullName: string; imageUrl?: string }[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onUpdate?: (updates: Partial<CreateTaskFormValues>) => void;
  onSelect?: (checked: boolean) => void;
  isSelected?: boolean;
  isArchived?: boolean;
}

export const TaskCard = ({
  _id,
  index = 0,
  title,
  description,
  priority,
  status,
  type,
  assigneeId,
  assigneeDetails = [],
  watcherDetails = [],
  dueDate,
  commentsCount = 0,
  linksCount = 0,
  scoreValue,
  startDate,
  estimatedHours,
  actualHours = 0,
  lastStatusChangedAt,
  progress,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdate,
  onSelect,
  isSelected,
  isArchived,
  projectId,
  onClick
}: TaskCardProps) => {
  const { can, currentUserId } = useProjectPermission(projectId);
  const isAssignee = currentUserId === assigneeId;
  const canDrag = can(PERMISSIONS.TASK_REORDER) || isAssignee;

  const DEFAULT_ESTIMATION = 8;
  const effectiveEstimation = estimatedHours && estimatedHours > 0 ? estimatedHours : DEFAULT_ESTIMATION;
  const isAutoEstimation = !estimatedHours || estimatedHours === 0;

  const { totalActualHours } = useTaskTimeTracking({
    status,
    lastStatusChangedAt,
    actualHours
  });

  return (
    <Draggable 
      draggableId={_id} 
      index={index}
      isDragDisabled={!canDrag}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            "group bg-card border border-border/50 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing",
            snapshot.isDragging && "shadow-xl border-primary/40 ring-2 ring-primary/10 rotate-2 scale-[1.02]",
            isArchived && "opacity-60 grayscale-[0.3] border-dashed bg-muted/5 shadow-none hover:shadow-none hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <TaskCardHeader 
              type={type}
              status={status}
              isSelected={isSelected}
              isArchived={isArchived}
              onSelect={onSelect}
              onUpdate={onUpdate}
            />
            <div className="flex items-start gap-2">
              {watcherDetails.length > 0 && (
                <AvatarGroup
                  users={watcherDetails}
                  max={3}
                  className="pt-0.5 [&_.h-8]:h-6 [&_.w-8]:w-6 [&_.-ml-3]:-ml-2 [&_.text-xs]:text-[10px]"
                />
              )}
              <TaskCardActions 
                isArchived={isArchived}
                can={can}
                onClick={onClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onUnarchive={onUnarchive}
              />
            </div>
          </div>

          <TaskCardTitle 
            title={title}
            description={description}
            can={can}
            onUpdate={onUpdate}
          />

          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Assignees :</span>
              <AvatarGroup users={assigneeDetails} max={3} />
            </div>
          </div>

          <TaskCardDates 
            startDate={startDate}
            dueDate={dueDate}
            status={status}
            priority={priority}
            onUpdate={onUpdate}
          />

          <TaskCardProgress 
            totalActualHours={totalActualHours}
            effectiveEstimation={effectiveEstimation}
            isAutoEstimation={isAutoEstimation}
            status={status}
            progress={progress}
          />

          <TaskCardFooter 
            commentsCount={commentsCount}
            linksCount={linksCount}
            scoreValue={scoreValue}
            totalActualHours={totalActualHours}
            status={status}
            priority={priority}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </Draggable>
  );
};
