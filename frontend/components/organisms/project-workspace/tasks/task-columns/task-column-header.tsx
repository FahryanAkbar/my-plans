"use client";

import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, MoreHorizontal, ListChecks, Trash2, MoveRight, Archive, ArchiveRestore } from "lucide-react";

import { 
  Badge, 
  Typography, 
  Button,
  Checkbox
} from "@/components/atoms";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/molecules";
import { TaskCardProps } from "@/components/organisms";

import { 
  CreateTaskFormValues, 
  PERMISSIONS, 
  TASK_STATUS, 
  TaskStatus, 
  cn,
  patterns,
  tokens
} from "@/lib";
import { useProjectPermission } from "@/hooks";

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

const statusColorConfig: Record<string, string> = {
  [TASK_STATUS.TODO]: "bg-zinc-400",
  [TASK_STATUS.IN_PROGRESS]: "bg-blue-500",
  [TASK_STATUS.BLOCKED]: "bg-rose-500",
  [TASK_STATUS.IN_REVIEW]: "bg-amber-500",
  [TASK_STATUS.DONE]: "bg-emerald-500",
};

export const TaskColumnHeader = ({
  projectId,
  id,
  title,
  tasks,
  onAddTask,
  onSelectAll,
  isAllSelected,
  selectedCount = 0,
  onBulkDelete,
  onBulkArchive,
  onBulkUnarchive,
  onBulkMove,
  selectedIds,
}: Pick<TaskColumnProps, 
  | "projectId" 
  | "id" 
  | "title" 
  | "tasks" 
  | "onAddTask" 
  | "onSelectAll" 
  | "isAllSelected" 
  | "selectedCount" 
  | "onBulkDelete" 
  | "onBulkArchive" 
  | "onBulkUnarchive" 
  | "onBulkMove" 
  | "selectedIds">
) => {
  const { can } = useProjectPermission(projectId);
  const canDelete = can(PERMISSIONS.TASK_DELETE);
  const canArchive = can(PERMISSIONS.TASK_ARCHIVE);

  const selectedTasks = tasks.filter((task) => selectedIds?.has(task._id));
  const nonArchivedSelectedCount = selectedTasks.filter((task) => !task.isArchived).length;
  const archivedSelectedCount = selectedTasks.filter((task) => task.isArchived).length;

  return (
    <div className={cn("flex items-center justify-between px-2 mb-4")}>
      <div className="flex items-center gap-x-2">
        <Checkbox 
          checked={isAllSelected}
          onCheckedChange={(checked) => onSelectAll?.(id, !!checked)}
          className={cn(
            "h-4 w-4",
            tokens.radius.md,
            tokens.border.subtle,
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          )}
        />
        <div className={cn(patterns.statusDot, statusColorConfig[id])} />
        <Typography className="font-bold text-sm text-foreground tracking-tight">
          {title}
        </Typography>
        <Badge 
          variant="secondary" 
          className={cn(
            "bg-muted/50 text-muted-foreground/70 px-1.5 py-0 min-w-5 justify-center border-none shadow-none",
            patterns.textTinyCaps
          )}
        >
          {tasks.length}
        </Badge>
      </div>
      <div className="flex items-center gap-x-1 opacity-0 group-hover/column:opacity-100 transition-all duration-300">
        <Button 
          onClick={() => onAddTask?.(id)}
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 group/btn",
            tokens.radius.lg
          )}
        >
          <Plus className="h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-90 group-hover/btn:scale-125" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 text-muted-foreground transition-all hover:bg-muted", 
                tokens.radius.lg,
                selectedCount > 0 && "text-primary bg-primary/10"
              )}
            >
              {selectedCount > 0 ? <ListChecks className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className={cn(patterns.textTinyCaps, "opacity-50 py-2")}>
              Column Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAddTask?.(id)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task to Column
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className={cn(patterns.textTinyCaps, "opacity-50 py-2")}>
              Bulk Operations ({selectedCount})
            </DropdownMenuLabel>
            {canDelete && (
              <DropdownMenuItem 
                disabled={selectedCount === 0}
                onClick={() => onBulkDelete?.(id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            )}
            {canArchive && (
              <DropdownMenuItem
                disabled={nonArchivedSelectedCount === 0}
                onClick={() => onBulkArchive?.(id)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected ({nonArchivedSelectedCount})
              </DropdownMenuItem>
            )}
            {canArchive && (
              <DropdownMenuItem
                disabled={archivedSelectedCount === 0}
                onClick={() => onBulkUnarchive?.(id)}
              >
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Unarchive Selected ({archivedSelectedCount})
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className={cn(patterns.textTinyCaps, "opacity-50 py-2")}>
              Move Selected To
            </DropdownMenuLabel>
            {Object.values(TASK_STATUS).filter(s => s !== id).map((s) => (
              <DropdownMenuItem 
                key={s}
                disabled={selectedCount === 0}
                onClick={() => onBulkMove?.(id, s)}
              >
                <MoveRight className="h-4 w-4 mr-2" />
                {s.replace("_", " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
