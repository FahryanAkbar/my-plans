"use client";

import React from "react";
import { ArrowRight, Plus } from "lucide-react";
import { cn, ISSUE_STATUS, IssueStatus, ISSUE_STATUS_CONFIG } from "@/lib";
import { IssueActivity } from "@/types/features";
import { Badge } from "@/components/atoms";

interface IssueActivityItemProps {
  activity: IssueActivity;
  isSubItem?: boolean;
}

const StatusPill = ({ status, className }: { status: string, className?: string }) => {
  const config = ISSUE_STATUS_CONFIG[status as IssueStatus] || ISSUE_STATUS_CONFIG[ISSUE_STATUS.OPEN];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none rounded shadow-none bg-muted/40 text-foreground flex items-center gap-1.5",
        className
      )}
    >
      <config.icon className={cn("h-3.5 w-3.5", config.textColor)} />
      {config.label}
    </Badge>
  );
};

export const IssueActivityItem = ({ activity, isSubItem }: IssueActivityItemProps) => {
  const isCreated = activity.action.toLowerCase() === "created";
  const isStatusChange = activity.action.toLowerCase() === "updated" && activity.field === "status";

  if (isCreated) {
    return (
      <Badge 
        variant="outline" 
        className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none rounded shadow-none bg-emerald-500/10 text-emerald-600 flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Issue Reported
      </Badge>
    );
  }

  if (isStatusChange) {
    const oldStatus = activity.oldValue as IssueStatus;
    const oldConfig = oldStatus ? ISSUE_STATUS_CONFIG[oldStatus] : null;

    return (
      <div className={cn(
        "flex items-center gap-2",
        isSubItem ? "justify-end flex-1" : ""
      )}>
        <div className="flex items-center gap-2 bg-muted/20 px-2 py-1 rounded-lg border border-border/20">
          {oldConfig ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1 line-through">
              {oldConfig.label}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1 line-through">
              {activity.oldValue?.replace('_', ' ') || "Open"}
            </span>
          )}
          <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
          <StatusPill status={activity.newValue || "OPEN"} />
        </div>
      </div>
    );
  }

  return (
    <div className="text-xs text-muted-foreground/60 italic">
      {activity.action} {activity.field}
    </div>
  );
};
