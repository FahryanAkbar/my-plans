"use client";

import React from "react";
import { Calendar, Paperclip, Link2 } from "lucide-react";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
} from "@/components/atoms";
import { IssueWithDetails } from "@/hooks";

interface IssueCardFooterProps {
  issue: IssueWithDetails;
}

export const IssueCardFooter = ({ issue }: IssueCardFooterProps) => {
  const formattedDate = new Date(issue.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).toUpperCase();

  return (
    <div className="flex items-center justify-between pt-2.5 border-t border-border/30">
      <div className="flex items-center gap-x-3.5">
        <div className="flex items-center gap-x-2 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black tracking-widest">{formattedDate}</span>
        </div>

        {issue.attachments && issue.attachments.length > 0 && (
          <div className="flex items-center gap-x-1 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" title={`${issue.attachments.length} Lampiran`}>
            <Paperclip className="w-3 h-3" />
            <span className="text-[9px] font-black">{issue.attachments.length}</span>
          </div>
        )}

        {issue.linkedTaskDetails && (
          <div 
            className="flex items-center gap-x-1.5 px-1.5 py-0.5 bg-muted/40 rounded-md border border-border/50 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
            title="Connected Task"
          >
            <Link2 className="w-2.5 h-2.5" />
            <span className="text-[8px] font-black tracking-tighter uppercase">Task</span>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <div className="flex items-center -space-x-2">
          {issue.reporterDetails && (
            <Avatar className="w-6 h-6 ring-2 ring-background group-hover:ring-accent transition-all">
              <AvatarImage src={issue.reporterDetails.imageUrl} />
              <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-black">
                {issue.reporterDetails.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          {issue.assigneeDetails && (
            <Avatar className="w-6 h-6 ring-2 ring-background group-hover:ring-accent transition-all">
              <AvatarImage src={issue.assigneeDetails.imageUrl} />
              <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-black">
                {issue.assigneeDetails.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
};
