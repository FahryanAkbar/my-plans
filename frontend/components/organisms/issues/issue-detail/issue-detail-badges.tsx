"use client";

import React from "react";
import { Flag } from "lucide-react";
import { Badge } from "@/components/atoms";
import { 
  cn, 
  ISSUE_SEVERITY_CONFIG, 
  ISSUE_STATUS_CONFIG, 
  IssueStatus, 
  IssueSeverity, 
  ISSUE_SEVERITY
} from "@/lib";
import { IssueWithDetails } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms";

interface IssueDetailBadgesProps {
  issue: IssueWithDetails;
}

export const IssueDetailBadges = ({ issue }: IssueDetailBadgesProps) => {
  const severityConfig = ISSUE_SEVERITY_CONFIG[issue.severity as IssueSeverity];
  const statusConfig = ISSUE_STATUS_CONFIG[issue.status as IssueStatus];

  return (
    <div className="flex items-center flex-wrap gap-3">
      <Badge 
        variant="outline" 
        className={cn(
          "h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none rounded shadow-none flex items-center gap-1.5",
          severityConfig.style
        )}
      >
        <Flag className={cn("h-3.5 w-3.5", 
          issue.severity === ISSUE_SEVERITY.CRITICAL ? "text-red-500" :
          issue.severity === ISSUE_SEVERITY.HIGH ? "text-orange-500" : 
          issue.severity === ISSUE_SEVERITY.MEDIUM ? "text-blue-500" : "text-zinc-500"
        )} />
        {severityConfig.label}
      </Badge>

      <Badge 
        variant="outline" 
        className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none rounded shadow-none bg-muted/40 text-foreground flex items-center gap-1.5"
      >
        <statusConfig.icon className={cn("h-3.5 w-3.5", statusConfig.textColor)} />
        {statusConfig.label}
      </Badge>

      {issue.labels && issue.labels.length > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-px h-4 bg-border/40 mx-1" />
          <div className="flex items-center gap-1.5 overflow-hidden">
            {issue.labels.slice(0, 3).map((label) => (
              <Badge 
                key={label} 
                variant="outline" 
                className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none shadow-none bg-primary/10 text-primary rounded whitespace-nowrap"
              >
                {label}
              </Badge>
            ))}
            
            {issue.labels.length > 3 && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none shadow-none bg-muted text-muted-foreground rounded cursor-help whitespace-nowrap"
                    >
                      +{issue.labels.length - 3}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover border-border p-2 rounded-lg shadow-xl">
                    <div className="flex flex-wrap gap-1 max-w-50">
                      {issue.labels.slice(3).map((label) => (
                        <Badge 
                          key={label} 
                          variant="outline" 
                          className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-none shadow-none bg-primary/10 text-primary rounded whitespace-nowrap"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
