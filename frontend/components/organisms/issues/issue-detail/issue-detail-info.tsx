"use client";

import Image from "next/image";
import React from "react";
import { User, Calendar, Flag, Link2, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, ISSUE_PRIORITY, ISSUE_PRIORITY_LABELS } from "@/lib";
import { IssueWithDetails } from "@/hooks";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

const InfoRow = ({ icon: Icon, label, children }: InfoRowProps) => (
  <div className="grid grid-cols-3 items-center py-3.5">
    <div className="flex items-center gap-2.5 text-muted-foreground/60">
      <Icon className="h-4 w-4" />
      <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
    </div>
    <div className="col-span-2">
      {children}
    </div>
  </div>
);

interface IssueDetailInfoProps {
  issue: IssueWithDetails;
}

export const IssueDetailInfo = ({ issue }: IssueDetailInfoProps) => {
  return (
    <div className="bg-muted/10 rounded-4xl p-6 divide-y divide-border/20 border border-border/30 shadow-inner">
      <InfoRow icon={User} label="Reporter">
        <div className="flex items-center gap-3">
          {issue.reporterDetails ? (
            <>
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-background shadow-sm">
                {issue.reporterDetails.imageUrl && (
                  <Image
                    src={issue.reporterDetails.imageUrl}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                    width={42}
                    height={42}
                    sizes="42px"
                  />
                )}
              </div>
              <span className="text-sm font-bold text-foreground/80">{issue.reporterDetails.fullName}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">Unknown</span>
          )}
        </div>
      </InfoRow>

      <InfoRow icon={User} label="Assignee">
        <div className="flex items-center gap-3">
          {issue.assigneeDetails ? (
            <>
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-background shadow-sm">
                {issue.assigneeDetails.imageUrl && (
                  <Image 
                    src={issue.assigneeDetails.imageUrl}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                    width={42}
                    height={42}
                    sizes="42px"
                  />
                )}
              </div>
              <span className="text-sm font-bold text-foreground/80">{issue.assigneeDetails.fullName}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground/40 italic font-medium">Unassigned</span>
          )}
        </div>
      </InfoRow>

      <InfoRow icon={Calendar} label="Reported">
        <div className="text-sm font-bold text-foreground/70">
          {format(issue.createdAt, "dd MMMM yyyy, HH:mm")}
        </div>
      </InfoRow>

      <InfoRow icon={Flag} label="Priority">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-2 h-2 rounded-full shadow-[0_0_8px]",
            issue.priority === ISSUE_PRIORITY.P0 ? "bg-red-500 shadow-red-500/50" : 
            issue.priority === ISSUE_PRIORITY.P1 ? "bg-orange-500 shadow-orange-500/50" : 
            "bg-blue-500 shadow-blue-500/50"
          )} />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-foreground/80">
              {issue.priority || "Not Set"}
            </span>
            {issue.priority && ISSUE_PRIORITY_LABELS[issue.priority as keyof typeof ISSUE_PRIORITY_LABELS] && (
              <>
                <div className="h-3 w-px bg-border/40 mx-1" />
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tight">
                  {ISSUE_PRIORITY_LABELS[issue.priority as keyof typeof ISSUE_PRIORITY_LABELS].split(" - ")[1]}
                </span>
              </>
            )}
          </div>
        </div>
      </InfoRow>

      {issue.linkedTaskDetails && (
        <InfoRow icon={Link2} label="Linked Task">
          <a 
            href={`/project/${issue.projectId}/tasks`}
            className="flex items-center gap-2 group/task hover:bg-primary/5 p-1 -ml-1 rounded-lg transition-colors"
          >
            <span className="text-sm font-bold text-primary underline underline-offset-4 decoration-primary/20 group-hover/task:decoration-primary">
              {issue.linkedTaskDetails.title}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-1.5 py-0.5 bg-muted/50 rounded-md">
              {issue.linkedTaskDetails.status.replace(/_/g, " ")}
            </span>
          </a>
        </InfoRow>
      )}
    </div>
  );
};
