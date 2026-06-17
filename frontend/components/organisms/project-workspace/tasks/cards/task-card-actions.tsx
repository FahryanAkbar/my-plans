"use client";

import React from "react";
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  ArchiveRestore, 
  Archive, 
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
import { Permission, PERMISSIONS } from "@/lib";

interface TaskCardActionsProps {
  isArchived?: boolean;
  can: (permission: Permission) => boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

export const TaskCardActions = ({
  isArchived,
  can,
  onClick,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}: TaskCardActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}>
              <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            {can(PERMISSIONS.TASK_UPDATE) && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}>
                <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                Edit Task
              </DropdownMenuItem>
            )}
            {can(PERMISSIONS.TASK_ARCHIVE) && (
              isArchived ? (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onUnarchive?.();
                }}>
                  <ArchiveRestore className="h-4 w-4 mr-2 text-muted-foreground" />
                  Unarchive Task
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsArchiveDialogOpen(true);
                }}>
                  <Archive className="h-4 w-4 mr-2 text-muted-foreground" />
                  Archive Task
                </DropdownMenuItem>
              )
            )}
            {can(PERMISSIONS.TASK_DELETE) && (
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        title="Archive Task"
        description="Are you sure you want to archive this task? You can still find it in the archived tasks list and restore it later."
        variant="warning"
        confirmText="Archive"
        onConfirm={() => {
          onArchive?.();
          setIsArchiveDialogOpen(false);
        }}
      />

      <ConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        variant="destructive"
        confirmText="Delete Task"
        onConfirm={() => {
          onDelete?.();
          setIsDeleteDialogOpen(false);
        }}
      />
    </>
  );
};


