"use client";

import React from "react";
import { 
  cn,
  IssueStatus,
  IssueSeverity,
  IssuePriority,
  ISSUE_STATUS_CONFIG,
  ISSUE_SEVERITY_CONFIG,
  ISSUE_PRIORITY_CONFIG,
  ISSUE_SEVERITY,
} from "@/lib";
import { IssueWithDetails } from "@/hooks";
import { Badge } from "@/components/atoms";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/molecules/dropdown";

interface IssueCardBadgesProps {
  issue: IssueWithDetails;
  onUpdate?: (updates: { severity?: IssueSeverity }) => void;
}

export const IssueCardBadges = ({ issue, onUpdate }: IssueCardBadgesProps) => {
  const statusConfig = ISSUE_STATUS_CONFIG[issue.status as IssueStatus];
  const severityConfig = ISSUE_SEVERITY_CONFIG[issue.severity as IssueSeverity];
  const priorityConfig = ISSUE_PRIORITY_CONFIG[issue.priority as IssuePriority];

  const PriorityIcon = priorityConfig?.icon;
  const priorityBadgeClass =
    issue.priority === "P0"
      ? "bg-rose-500/10 text-rose-500"
      : issue.priority === "P1"
        ? "bg-orange-500/10 text-orange-500"
        : issue.priority === "P2"
          ? "bg-blue-500/10 text-blue-500"
          : "bg-zinc-500/10 text-zinc-500";

  return (
    <div className="flex items-center gap-x-2 px-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Badge
            variant="outline"
            className={cn(
              "h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
              severityConfig?.style
            )}
          >
            {severityConfig?.label}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          {Object.values(ISSUE_SEVERITY).map((severity) => (
            <DropdownMenuItem 
              key={severity}
              onClick={(e) => {
                e.stopPropagation();
                if (severity !== issue.severity) {
                  onUpdate?.({ severity: severity as IssueSeverity });
                }
              }}
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              <div className={cn(
                "w-2 h-2 rounded-full mr-2",
                ISSUE_SEVERITY_CONFIG[severity as IssueSeverity]?.style.split(' ')[1].replace('text-', 'bg-')
              )} />
              {ISSUE_SEVERITY_CONFIG[severity as IssueSeverity]?.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge
        variant="outline"
        className={cn(
          "h-5 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider border-none shadow-none whitespace-nowrap",
          priorityBadgeClass
        )}
      >
        {PriorityIcon && <PriorityIcon className={cn("w-3 h-3", priorityConfig.color)} />}
        <span>
          {priorityConfig?.label}
        </span>
      </Badge>

      <Badge
        variant="outline"
        className={cn(
          "h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none shadow-none whitespace-nowrap",
          statusConfig?.textColor === "text-blue-500" && "bg-blue-500/10 text-blue-500",
          statusConfig?.textColor === "text-amber-500" && "bg-amber-500/10 text-amber-500",
          statusConfig?.textColor === "text-green-500" && "bg-emerald-500/10 text-emerald-500",
          statusConfig?.textColor === "text-zinc-500" && "bg-zinc-500/10 text-zinc-500"
        )}
      >
        {statusConfig?.label}
      </Badge>

      {issue.isArchived && (
        <div className="flex items-center gap-x-1 ml-auto">
          <div className="h-3 w-px bg-border/40 mx-1" />
          <div className="px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
            <span className="text-[8px] font-black text-red-500/60 uppercase tracking-tighter">
              Archived
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
