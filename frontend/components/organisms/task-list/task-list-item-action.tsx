"use client";

import React from "react";
import { 
  MoreVertical, 
  Eye, 
  Pencil, 
  Archive, 
  ArchiveRestore, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/atoms";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  ConfirmModal
} from "@/components/molecules";
import { Id } from "@/convex/_generated/dataModel";
import { PERMISSIONS, Permission, cn } from "@/lib";

interface TaskListItemActionsProps {
  id: Id<"tasks">;
  isArchived?: boolean;
  can: (permission: Permission) => boolean;
  onClick?: (id: Id<"tasks">) => void;
  onEdit?: (id: Id<"tasks">) => void;
  onDelete?: (id: Id<"tasks">) => void;
  onArchive?: (id: Id<"tasks">) => void;
  onUnarchive?: (id: Id<"tasks">) => void;
  /** If true, the trigger button is always visible (for mobile touch UX) */
  alwaysVisible?: boolean;
}

export const TaskListItemActions = ({
  id,
  isArchived,
  can,
  onClick,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  alwaysVisible = false,
}: TaskListItemActionsProps) => {
  const [isArchiveModalOpen, setIsArchiveModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-opacity",
              alwaysVisible
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onClick?.(id)}>
            <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
            View Details
          </DropdownMenuItem>
          
          {can(PERMISSIONS.TASK_UPDATE) && (
            <DropdownMenuItem onClick={() => onEdit?.(id)}>
              <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
              Edit Task
            </DropdownMenuItem>
          )}

          {can(PERMISSIONS.TASK_ARCHIVE) && (
            isArchived ? (
              <DropdownMenuItem onClick={() => onUnarchive?.(id)}>
                <ArchiveRestore className="h-4 w-4 mr-2 text-muted-foreground" />
                Unarchive Task
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setIsArchiveModalOpen(true)}>
                <Archive className="h-4 w-4 mr-2 text-muted-foreground" />
                Archive Task
              </DropdownMenuItem>
            )
          )}

          {can(PERMISSIONS.TASK_DELETE) && (
            <>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        title="Archive Task"
        description="Are you sure you want to archive this task? You can still find it in the archived tasks list and restore it later."
        variant="warning"
        confirmText="Archive"
        onConfirm={() => {
          onArchive?.(id);
          setIsArchiveModalOpen(false);
        }}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        variant="destructive"
        confirmText="Delete Task"
        onConfirm={() => {
          onDelete?.(id);
          setIsDeleteModalOpen(false);
        }}
      />
    </div>
  );
};

