"use client";

import React from "react";
import { useQuery } from "convex/react";
import { History } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { TaskDetailSheetProps, TaskWithDetails } from "@/types/features";

import {
  Dialog,
  DialogContent,
  VisuallyHidden,
  Typography,
  DialogTitle,
  DialogDescription
} from "@/components/atoms";
import { TaskDetailSkeleton } from "@/components/organisms";

import {
  TaskDetailHeader, 
  TaskDetailInfo, 
  TaskDetailTitle, 
  TaskDetailDescription
} from "./task-details";
import { TaskComments } from "./task-comments";
import { TaskActivityList } from "./task-activity-list";

export const TaskDetailSheet = ({
  taskId,
  isOpen,
  onClose,
  onEdit
}: TaskDetailSheetProps) => {
  const task = useQuery(api.task.getById, taskId ? { taskId } : "skip");
  const hasClosedMissingTaskRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && task === null && !hasClosedMissingTaskRef.current) {
      hasClosedMissingTaskRef.current = true;
      onClose();
      return;
    }

    if (!isOpen || task !== null) {
      hasClosedMissingTaskRef.current = false;
    }
  }, [isOpen, task, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <VisuallyHidden>
        <DialogTitle>Task Details</DialogTitle>
        <DialogDescription>Task Details Desc</DialogDescription>
      </VisuallyHidden>
      <DialogContent 
        className="fixed inset-y-0 right-0 left-auto translate-x-0 translate-y-0 h-full w-full max-w-xl rounded-none border-l shadow-2xl p-0 flex flex-col animate-in slide-in-from-right duration-300 outline-none"
        showCloseButton={false}
      >
        <TaskDetailHeader 
          onClose={onClose} 
          onEdit={() => task && onEdit?.(task as TaskWithDetails)}
        />

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-background">
          {task === undefined ? (
            <TaskDetailSkeleton />
          ) : task === null ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
              <Typography variant="smallText" className="font-semibold">
                This task may have been deleted or is inaccessible. Please refresh the page or contact support if the issue persists.
              </Typography>
            </div>
          ) : (
            <>
              <TaskDetailTitle task={task as TaskWithDetails} />
              
              <TaskDetailInfo task={task as TaskWithDetails} />

              <TaskDetailDescription task={task as TaskWithDetails} />

              <div className="pt-2">
                <TaskComments taskId={task._id} />
              </div>

              <div className="pt-8 border-t border-border/50">
                <div className="flex items-center gap-2 mb-8">
                  <History className="h-4 w-4 text-muted-foreground/60" />
                  <Typography variant="smallText" className="font-bold text-muted-foreground/60 uppercase tracking-[0.2em] text-[10px] block">
                    Activity History
                  </Typography>
                </div>
                <TaskActivityList taskId={task._id} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
