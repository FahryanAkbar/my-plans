"use client";

import React from "react";
import { LayoutGrid, History, Paperclip } from "lucide-react";
import { Typography } from "@/components/atoms";
import { IssueWithDetails } from "@/hooks";
import { IssueComments } from "../issue-comments";
import { IssueActivityList } from "../issue-activity-list";
import { IssueAttachmentItem } from "./issue-attachment-item";

interface IssueDetailContentProps {
  issue: IssueWithDetails;
}

export const IssueDetailContent = ({ issue }: IssueDetailContentProps) => {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 text-muted-foreground/40">
          <LayoutGrid className="h-4 w-4" />
          <Typography className="font-black uppercase tracking-[0.25em] text-[10px]">Description</Typography>
        </div>
        <div className="bg-muted/5 rounded-[2rem] p-8 border border-border/20 min-h-40 relative group/desc hover:border-primary/20 transition-all duration-300">
          {issue.description ? (
            <Typography className="text-base leading-relaxed whitespace-pre-wrap text-foreground/80 font-medium">
              {issue.description}
            </Typography>
          ) : (
            <Typography className="text-muted-foreground/30 italic font-medium">
              No detailed description provided for this issue.
            </Typography>
          )}
        </div>
      </div>

      {issue.attachments && issue.attachments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-muted-foreground/40">
            <Paperclip className="h-4 w-4" />
            <Typography className="font-black uppercase tracking-[0.25em] text-[10px]">Attachments</Typography>
          </div>
          <div className="flex flex-wrap gap-4">
            {issue.attachments.map((id) => (
              <IssueAttachmentItem key={id} storageId={id} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <IssueComments issueId={issue._id} />
      </div>

      <div className="pt-10 border-t border-border/30">
        <div className="flex items-center gap-2.5 mb-8 text-muted-foreground/40">
          <History className="h-4 w-4" />
          <Typography className="font-black uppercase tracking-[0.25em] text-[10px]">Activity History</Typography>
        </div>
        <IssueActivityList issueId={issue._id} />
      </div>
    </div>
  );
};
