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
import { IssueForm, TaskProjectMember } from "./form/issue-form";
import { CreateIssueFormValues, IssueStatus } from "@/lib";
import { IssueWithDetails } from "@/hooks/";
import { Id } from "@/convex/_generated/dataModel";

interface IssueFormModalProps {
  projectId: Id<"projects">;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateIssueFormValues) => Promise<void>;
  initialStatus?: IssueStatus;
  initialData?: IssueWithDetails;
  members?: TaskProjectMember[];
}

export const IssueFormModal = ({
  projectId,
  isOpen,
  onOpenChange,
  onSubmit,
  initialStatus,
  initialData,
  members = []
}: IssueFormModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-3xl overflow-y-auto max-h-[85vh] p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-none shadow-2xl scrollbar-hide">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle className="text-xl font-bold">
              {initialData ? "Edit Issue" : "Report New Issue"}
            </DialogTitle>
            <DialogDescription>
              Form to {initialData ? "edit an existing" : "create a new"} issue in the project tracker.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="pt-4">
          <IssueForm 
            projectId={projectId}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            initialStatus={initialStatus}
            initialData={initialData}
            members={members}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
