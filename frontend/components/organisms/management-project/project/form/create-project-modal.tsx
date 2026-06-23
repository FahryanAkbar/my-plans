"use client";

import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogTitle,
  VisuallyHidden
} from "@/components/atoms";

import { ProjectForm } from "./create-project-form";

export const CreateProjectModal = ({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Create a new project</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new project workspace.
        </DialogDescription>
      </VisuallyHidden>

      <DialogContent className="w-[95vw] sm:w-full max-w-3xl p-4 sm:p-6 border-none shadow-xl rounded-2xl">
        <div className="overflow-y-auto max-h-[85vh] scrollbar-hide">
          <ProjectForm onCancel={onOpenChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
};