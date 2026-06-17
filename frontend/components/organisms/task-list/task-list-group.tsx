"use client";

import React, { useState } from "react";
import { 
  ChevronRight, 
  LayoutGrid,
  Type,
  Users,
  Calendar,
  Flag,
  Tag,
  ListChecks,
} from "lucide-react";
import { 
  Typography,
  Button,
  Badge,
  Checkbox
} from "@/components/atoms";
import {  
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/molecules";
import { 
  cn,
  TaskStatus,
  TASK_LIST_GRID_TEMPLATE, 
  getStatusVisualConfig
} from "@/lib";

import { TaskListColumnHeader } from "./task-list-column-header";
import { TaskListBulkActions } from "./task-list-bulk-actions";

interface TaskListGroupProps {
  status: TaskStatus;
  title: string;
  count: number;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  canDelete?: boolean;
  canArchive?: boolean;
  nonArchivedSelectedCount?: number;
  archivedSelectedCount?: number;
  onAddTask?: (status: TaskStatus) => void;
  onBulkDelete?: (status: TaskStatus) => void;
  onBulkArchive?: (status: TaskStatus) => void;
  onBulkUnarchive?: (status: TaskStatus) => void;
  onBulkMove?: (status: TaskStatus, newStatus: TaskStatus) => void;
  onSelectAll?: (status: TaskStatus, checked: boolean) => void;
  isAllSelected?: boolean;
  selectedCount?: number;
  className?: string;
}

export const TaskListGroup = ({
  status,
  title,
  count,
  children,
  defaultCollapsed = false,
  canDelete = false,
  canArchive = false,
  nonArchivedSelectedCount = 0,
  archivedSelectedCount = 0,
  onAddTask,
  onBulkDelete,
  onBulkArchive,
  onBulkUnarchive,
  onBulkMove,
  onSelectAll,
  isAllSelected,
  selectedCount = 0,
  className
}: TaskListGroupProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={cn(
        "bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm mb-8",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/40 group/header">
        <div className="flex items-center gap-x-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hover:bg-muted/50 transition-all active:scale-90",
              !isCollapsed && "bg-muted/30"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground/60 transition-transform duration-300",
                !isCollapsed && "rotate-90 text-primary"
              )}
            />
          </Button>

          <div className="flex items-center gap-x-2">
            <div className={cn("w-2 h-2 rounded-full", {
              "bg-zinc-400": status === "TODO",
              "bg-blue-500": status === "IN_PROGRESS",
              "bg-rose-500": status === "BLOCKED",
              "bg-amber-500": status === "IN_REVIEW",
              "bg-emerald-500": status === "DONE",
            })} />
            <Typography className="text-sm font-bold tracking-tight text-foreground">
              {getStatusVisualConfig(status).label}
            </Typography>

            <Badge 
              variant="secondary" 
              className="bg-muted/50 text-muted-foreground/70 px-1.5 py-0 min-w-5 justify-center border-none shadow-none text-[10px] font-black uppercase tracking-tight"
            >
              {count}
            </Badge>
          </div>
        </div>

        {/* Desktop: bulk action dropdown */}
        {selectedCount > 0 && (
          <div className="hidden md:flex items-center gap-x-2 animate-in fade-in zoom-in duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-muted-foreground transition-all hover:bg-muted rounded-lg",
                    selectedCount > 0 && "text-primary bg-primary/10 shadow-sm"
                  )}
                >
                  <ListChecks className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <TaskListBulkActions 
                status={status}
                title={title}
                selectedCount={selectedCount}
                nonArchivedSelectedCount={nonArchivedSelectedCount}
                archivedSelectedCount={archivedSelectedCount}
                canDelete={canDelete}
                canArchive={canArchive}
                onAddTask={onAddTask}
                onBulkDelete={onBulkDelete}
                onBulkArchive={onBulkArchive}
                onBulkUnarchive={onBulkUnarchive}
                onBulkMove={onBulkMove}
              />
            </DropdownMenu>
          </div>
        )}

        <div className="md:hidden flex items-center gap-x-2">
          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] font-bold text-primary bg-primary/10 rounded-lg gap-x-1"
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  {selectedCount} selected
                </Button>
              </DropdownMenuTrigger>
              <TaskListBulkActions 
                status={status}
                title={title}
                selectedCount={selectedCount}
                nonArchivedSelectedCount={nonArchivedSelectedCount}
                archivedSelectedCount={archivedSelectedCount}
                canDelete={canDelete}
                canArchive={canArchive}
                onAddTask={onAddTask}
                onBulkDelete={onBulkDelete}
                onBulkArchive={onBulkArchive}
                onBulkUnarchive={onBulkUnarchive}
                onBulkMove={onBulkMove}
              />
            </DropdownMenu>
          )}
          {count > 0 && (
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) => onSelectAll?.(status, !!checked)}
              className="h-4 w-4 rounded-md border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="hidden md:block bg-muted/5 border-b border-border/40">
            <div
              className={cn(
                "grid items-center gap-x-4 px-4 py-2",
                TASK_LIST_GRID_TEMPLATE
              )}
            >
              <div className="w-6" />
              <div className="flex items-center justify-center">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAll?.(status, !!checked)}
                  className="h-4 w-4 rounded-lg border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>

              <div className="flex items-center justify-center text-muted-foreground/50">
                <LayoutGrid className="h-3.5 w-3.5" />
              </div>
              <TaskListColumnHeader icon={Type} label="Task" />
              <TaskListColumnHeader icon={Tag} label="Type" />
              <TaskListColumnHeader icon={Type} label="Description" />
              <TaskListColumnHeader icon={Users} label="Assignee" />
              <TaskListColumnHeader icon={Calendar} label="Due Date" />
              <TaskListColumnHeader icon={Flag} label="Priority" />
              <div />
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
