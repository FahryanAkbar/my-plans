"use client";

import React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

import { CreateTaskFormValues } from "@/lib/schema";
import { 
  PERMISSIONS, 
  Permission, 
  TASK_LIST_GRID_TEMPLATE, 
  TASK_STATUS, 
  TaskStatus, 
  TaskPriority,
  TASK_TYPE_CONFIGURATION,
  getPriorityVisualConfig,
} from "@/lib";
import { format, isPast, isToday } from "date-fns";
import { Calendar, Flag, User } from "lucide-react";
import { Badge, Avatar, AvatarImage, AvatarFallback, Checkbox, Typography } from "@/components/atoms";

import { TaskListItemCheckbox } from "./task-list-item-checkbox";
import { TaskListItemTitle } from "./task-list-item-title";
import { TaskListItemMetadata } from "./task-list-item-metadata";
import { TaskListItemActions } from "./task-list-item-action";

interface TaskListItemProps {
  id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  type?: string;
  priority?: TaskPriority;
  dueDate?: number | string;
  assignee?: {
    name?: string;
    imageUrl?: string;
  };
  onToggleStatus?: (id: Id<"tasks">, currentStatus: TaskStatus) => void;
  onClick?: (id: Id<"tasks">) => void;
  onEdit?: (id: Id<"tasks">) => void;
  onDelete?: (id: Id<"tasks">) => void;
  onArchive?: (id: Id<"tasks">) => void;
  onUnarchive?: (id: Id<"tasks">) => void;
  onSelect?: (id: Id<"tasks">, checked: boolean) => void;
  onUpdate?: (id: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => void;
  isSelected?: boolean;
  can?: (permission: Permission) => boolean;
  isArchived?: boolean;
  className?: string;
  isSubtask?: boolean;
}

export const TaskListItem = ({
  id,
  title,
  description,
  status,
  type,
  priority,
  dueDate,
  assignee,
  onToggleStatus,
  onClick,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onSelect,
  onUpdate,
  isSelected,
  can = () => true,
  isArchived,
  className,
  isSubtask,
}: TaskListItemProps) => {
  const isDone = status === TASK_STATUS.DONE;

  const date = dueDate ? new Date(dueDate) : null;
  const isOverdue = date ? isPast(date) && !isToday(date) : false;
  const priorityCfg = priority ? getPriorityVisualConfig(priority) : null;
  const typeCfg = type ? TASK_TYPE_CONFIGURATION[type as keyof typeof TASK_TYPE_CONFIGURATION] : null;

  return (
    <div
      className={cn(
        "group border-b border-border/40 hover:bg-muted/30 transition-all duration-200",
        isDone && "bg-muted/10 opacity-75",
        className
      )}
    >
      <div
        className={cn(
          "hidden md:grid items-center gap-x-4 w-full min-h-13 px-4 py-2",
          TASK_LIST_GRID_TEMPLATE
        )}
      >
        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground/30">
          <GripVertical className="h-4 w-4" />
        </div>

        <TaskListItemCheckbox 
          id={id}
          status={status}
          isDone={isDone}
          isSelected={isSelected}
          onToggleStatus={onToggleStatus}
          onSelect={onSelect}
        />

        <TaskListItemTitle 
          id={id}
          title={title}
          isDone={isDone}
          isSubtask={isSubtask}
          canUpdate={can(PERMISSIONS.TASK_UPDATE)}
          onUpdate={onUpdate}
          onClick={onClick}
        />

        <TaskListItemMetadata 
          id={id}
          type={type}
          description={description}
          assignee={assignee}
          dueDate={dueDate}
          priority={priority}
          onUpdate={onUpdate}
        />

        <TaskListItemActions 
          id={id}
          isArchived={isArchived}
          can={can}
          onClick={onClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
        />
      </div>

      <div className="md:hidden flex items-start gap-x-3 px-3 py-3">
        <div className="flex flex-col items-center gap-y-1.5 pt-0.5 shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(id, !!checked)}
            className="h-3.5 w-3.5 rounded-md border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Checkbox
            id={`mobile-task-status-${id}`}
            checked={isDone}
            onCheckedChange={() => onToggleStatus?.(id, status)}
            className="h-4 w-4 transition-transform active:scale-90 cursor-pointer"
          />
        </div>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onClick?.(id)}
        >
          <Typography
            className={cn(
              "text-sm font-semibold leading-snug truncate",
              isDone && "line-through text-muted-foreground font-medium"
            )}
          >
            {title}
          </Typography>

          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
            {typeCfg && (
              <Badge
                className={cn(
                  "h-4.5 px-1.5 text-[9px] font-bold uppercase tracking-wider border-none leading-none",
                  typeCfg.color
                )}
              >
                {typeCfg.label}
              </Badge>
            )}

            {priorityCfg && (
              <Badge
                className={cn(
                  "h-4.5 px-1.5 text-[9px] font-bold uppercase tracking-wider border-none leading-none flex items-center gap-x-1",
                  priorityCfg.color
                )}
              >
                <Flag className="h-2.5 w-2.5" />
                {priority}
              </Badge>
            )}

            {date && (
              <span
                className={cn(
                  "flex items-center gap-x-1 text-[10px] font-semibold",
                  isOverdue ? "text-rose-500" : "text-muted-foreground"
                )}
              >
                <Calendar className="h-2.5 w-2.5 shrink-0" />
                {format(date, "MMM d")}
              </span>
            )}

            {(assignee?.name || assignee?.imageUrl) ? (
              <span className="flex items-center gap-x-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={assignee.imageUrl} />
                  <AvatarFallback className="text-[8px] bg-muted">
                    {assignee.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-20">
                  {assignee.name}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-x-1 text-[10px] text-muted-foreground/50">
                <User className="h-2.5 w-2.5" />
                Unassigned
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 self-center">
          <TaskListItemActions
            id={id}
            isArchived={isArchived}
            can={can}
            onClick={onClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            alwaysVisible
          />
        </div>
      </div>
    </div>
  );
}