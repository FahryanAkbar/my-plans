"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Typography } from "@/components/atoms";
import { ISSUE_ACTIVITY_CONFIG, ISSUE_ACTIVITY_ACTION } from "@/lib";
import { GroupedActivity } from "@/lib/features/issue/issue-activity";
import { IssueActivityItem } from "./issue-activity-item";

interface IssueActivityGroupProps {
  group: GroupedActivity;
}

export const IssueActivityGroup = ({ group }: IssueActivityGroupProps) => {
  const hasSubActivities = group.subActivities.length > 0;
  const [isExpanded, setIsExpanded] = React.useState(!hasSubActivities ? true : false);

  const action = group.mainActivity.action.toLowerCase();
  const field = group.mainActivity.field;
  
  const configKey = action === "created" ? ISSUE_ACTIVITY_ACTION.CREATED : 
                    (action === "updated" && field === "status") ? ISSUE_ACTIVITY_ACTION.STATUS_CHANGE :
                    action === "comment_added" ? ISSUE_ACTIVITY_ACTION.COMMENT_ADDED : "DEFAULT";

  const config = ISSUE_ACTIVITY_CONFIG[configKey as keyof typeof ISSUE_ACTIVITY_CONFIG] || ISSUE_ACTIVITY_CONFIG.DEFAULT;
  const Icon = config.icon;

  return (
    <div className="relative pl-12 group/activity">
      {hasSubActivities && isExpanded && (
        <div className="absolute left-4.5 top-10 bottom-2 w-px bg-border/40" />
      )}

      <div className={`absolute left-0 top-0 h-9 w-9 rounded-full flex items-center justify-center ring-4 ring-background shadow-sm ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex flex-col gap-0.5">
            <Typography className="text-sm font-bold text-foreground tracking-tight">
              {group.user?.fullName || "System"}
              <span className="ml-1.5 font-medium text-muted-foreground/60">
                {config.label.toLowerCase()}
              </span>
              {group.issueTitle && (
                <span className="ml-1.5 font-bold text-foreground/80 underline decoration-border/60 underline-offset-4 cursor-help">
                  {group.issueTitle}
                </span>
              )}
            </Typography>
          </div>

          <IssueActivityItem activity={group.mainActivity} isSubItem={false} />
          
          <div className="flex items-center gap-2">
            <span className="block text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
              {formatDistanceToNow(group.timestamp, { addSuffix: true, locale: enUS })}
            </span>
            {hasSubActivities && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {isExpanded ? "Hide" : "Show"} {group.subActivities.length} more
              </button>
            )}
          </div>
        </div>

        {hasSubActivities && isExpanded && (
          <div className="space-y-4 pt-1">
            {group.subActivities.map((sub) => (
              <div key={sub._id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-border/60" />
                
                <div className="space-y-1">
                  <Typography className="text-[11px] font-bold text-muted-foreground/80 tracking-tight">
                    {(sub.action.toLowerCase() === "updated" && sub.field === "status") ? "Changed status" : "Updated issue"}
                  </Typography>
                  <IssueActivityItem activity={sub} isSubItem={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
