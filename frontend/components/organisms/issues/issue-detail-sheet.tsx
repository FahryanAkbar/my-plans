"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { IssueWithDetails } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  VisuallyHidden,
  Typography,
  DialogTitle
} from "@/components/atoms";
import { 
  IssueDetailHeader, 
  IssueDetailInfo, 
  IssueDetailContent,
  IssueDetailBadges
} from "./issue-detail";
import { IssueDetailSkeleton } from "./loading-skeletons";

interface IssueDetailSheetProps {
  issueId: Id<"issues"> | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const IssueDetailSheet = ({
  issueId,
  isOpen,
  onClose,
  onEdit
}: IssueDetailSheetProps) => {
  const issue = useQuery(api.issues.getById, issueId ? { issueId } : "skip") as IssueWithDetails | undefined;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <VisuallyHidden>
        <DialogTitle>Issue Details</DialogTitle>
        <DialogDescription>
          Detailed view of the selected issue including reporter, assignee, and comments.
        </DialogDescription>
      </VisuallyHidden>
      <DialogContent 
        className="fixed inset-y-0 right-0 left-auto translate-x-0 translate-y-0 h-full w-full max-w-xl rounded-none border-l border-border/50 shadow-2xl p-0 flex flex-col animate-in slide-in-from-right duration-500 outline-none bg-background"
        showCloseButton={false}
      >
        <IssueDetailHeader 
          onClose={onClose} 
          onEdit={onEdit} 
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-10 scrollbar-hide pb-24 sm:pb-8">
          {!issue ? (
            <IssueDetailSkeleton />
          ) : (
            <>
              <div className="space-y-5">
                <IssueDetailBadges issue={issue} />
                <div className="space-y-1">
                  <Typography className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-foreground">
                    {issue.title}
                  </Typography>
                </div>
              </div>

              <IssueDetailInfo issue={issue} />
              <IssueDetailContent issue={issue} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
