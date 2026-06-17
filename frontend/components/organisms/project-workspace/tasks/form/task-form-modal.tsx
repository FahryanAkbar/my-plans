"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  VisuallyHidden 
} from "@/components/atoms";
import { CreateTaskForm } from "./create-task-form";
import { TaskStatus } from "@/lib";
import { CreateTaskFormValues } from "@/lib/schema/zod/tasks/create-task";
import { TaskCardProps, ProjectMember } from "../task-card";

interface TaskFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateTaskFormValues) => Promise<void>;
  initialStatus?: TaskStatus;
  initialData?: TaskCardProps;
  members?: ProjectMember[];
  title?: string;
  description?: string;
}

export const TaskFormModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialStatus,
  initialData,
  members,
  title,
  description
}: TaskFormModalProps) => {
  const modalTitle = title || (initialData ? "Edit Task" : "Create New Task");
  const modalDescription = description || (initialData ? "Update the details of your task." : "Fill in the details to create a new task in your project.");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-3xl overflow-y-auto max-h-[85vh] p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-none shadow-2xl scrollbar-hide">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <CreateTaskForm 
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          initialStatus={initialStatus}
          initialData={initialData}
          members={members}
        />
      </DialogContent>
    </Dialog>
  );
};
