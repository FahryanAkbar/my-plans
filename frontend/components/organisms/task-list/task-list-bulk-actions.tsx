"use client";

import React from "react";
import { Plus, Trash2, MoveRight, Archive, ArchiveRestore } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/molecules";
import { TaskStatus, TASK_STATUS } from "@/lib";
import { getStatusVisualConfig } from "@/lib/constants";

interface TaskListBulkActionsProps {
  status: TaskStatus;
  title: string;
  selectedCount: number;
  nonArchivedSelectedCount?: number;
  archivedSelectedCount?: number;
  canDelete?: boolean;
  canArchive?: boolean;
  onAddTask?: (status: TaskStatus) => void;
  onBulkDelete?: (status: TaskStatus) => void;
  onBulkArchive?: (status: TaskStatus) => void;
  onBulkUnarchive?: (status: TaskStatus) => void;
  onBulkMove?: (status: TaskStatus, newStatus: TaskStatus) => void;
}

export const TaskListBulkActions = ({
  status,
  selectedCount,
  nonArchivedSelectedCount = 0,
  archivedSelectedCount = 0,
  canDelete = false,
  canArchive = false,
  onAddTask,
  onBulkDelete,
  onBulkArchive,
  onBulkUnarchive,
  onBulkMove,
}: TaskListBulkActionsProps) => {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">
        Group Actions ({getStatusVisualConfig(status).label})
      </DropdownMenuLabel>
      <DropdownMenuItem onClick={() => onAddTask?.(status)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Task to This Group
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">
        Bulk Operations
      </DropdownMenuLabel>
      {canDelete && (
        <DropdownMenuItem 
          disabled={selectedCount === 0}
          onClick={() => onBulkDelete?.(status)}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected ({selectedCount})
        </DropdownMenuItem>
      )}
      {canArchive && (
        <DropdownMenuItem
          disabled={nonArchivedSelectedCount === 0}
          onClick={() => onBulkArchive?.(status)}
        >
          <Archive className="h-4 w-4 mr-2" />
          Archive Selected ({nonArchivedSelectedCount})
        </DropdownMenuItem>
      )}
      {canArchive && (
        <DropdownMenuItem
          disabled={archivedSelectedCount === 0}
          onClick={() => onBulkUnarchive?.(status)}
        >
          <ArchiveRestore className="h-4 w-4 mr-2" />
          Unarchive Selected ({archivedSelectedCount})
        </DropdownMenuItem>
      )}
      
      <DropdownMenuSeparator />
      
      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">
        Move Selected To
      </DropdownMenuLabel>
      {Object.values(TASK_STATUS)
        .filter((s) => s !== status)
        .map((s) => (
          <DropdownMenuItem 
            key={s}
            disabled={selectedCount === 0}
            onClick={() => onBulkMove?.(status, s)}
          >
            <MoveRight className="h-4 w-4 mr-2" />
            {getStatusVisualConfig(s).label}
          </DropdownMenuItem>
        ))}
    </DropdownMenuContent>
  );
};
