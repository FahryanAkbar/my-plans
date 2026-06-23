"use client";

import React from "react";
import { History } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

;
import { Typography, TooltipProvider } from "@/components/atoms";
import { IssueActivityGroup } from "./issue-activity";
import { IssueActivitySkeleton } from "./loading-skeletons";

import { cn, groupIssueActivities } from "@/lib";
import { IssueActivity } from "@/types/features";

interface IssueActivityListProps {
  issueId?: Id<"issues">;
  projectId?: Id<"projects">;
  search?: string;
  selectedActions?: string[];
  selectedMemberId?: string;
  selectedPeriod?: string;
  className?: string;
  onStatsUpdate?: (stats: { total: number; filtered: number }) => void;
}

export const IssueActivityList = ({ 
  issueId, 
  projectId, 
  search = "", 
  selectedActions = [], 
  selectedMemberId = "all",
  selectedPeriod = "all",
  className,
  onStatsUpdate
}: IssueActivityListProps) => {
  const activities = useQuery(
    projectId ? api.issueActivity.getByProjectId : api.issueActivity.getByIssueId, 
    projectId ? { projectId } : issueId ? { issueId } : "skip"
  ) as (IssueActivity & { issueTitle?: string })[] | undefined;

  const filteredActivities = React.useMemo(() => {
    if (!activities) return [];
    
    return activities.filter(activity => {
      const matchesSearch = !search || 
        activity.issueTitle?.toLowerCase().includes(search.toLowerCase()) ||
        activity.user?.fullName.toLowerCase().includes(search.toLowerCase()) ||
        activity.action.toLowerCase().includes(search.toLowerCase());

      const activityAction = activity.action.toLowerCase();
      const mappedAction = activityAction === "created" ? "created" :
                           (activityAction === "updated" && activity.field === "status") ? "updated" :
                           activityAction === "comment_added" ? "comment_added" : "other";

      const matchesAction = selectedActions.length === 0 || selectedActions.includes(mappedAction);

      const matchesMember = selectedMemberId === "all" || activity.userId.toString() === selectedMemberId;

      let matchesPeriod = true;
      if (selectedPeriod !== "all") {
        const now = new Date();
        const activityDate = new Date(activity.createdAt);
        
        if (selectedPeriod === "today") {
          matchesPeriod = activityDate >= new Date(now.setHours(0, 0, 0, 0));
        } else if (selectedPeriod === "7days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          matchesPeriod = activityDate >= sevenDaysAgo;
        } else if (selectedPeriod === "30days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchesPeriod = activityDate >= thirtyDaysAgo;
        }
      }

      return matchesSearch && matchesAction && matchesMember && matchesPeriod;
    });
  }, [activities, search, selectedActions, selectedMemberId, selectedPeriod]);

  React.useEffect(() => {
    if (activities && onStatsUpdate) {
      onStatsUpdate({
        total: activities.length,
        filtered: filteredActivities.length
      });
    }
  }, [activities, filteredActivities.length, onStatsUpdate]);

  if (activities === undefined) {
    return <IssueActivitySkeleton />;
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
        <History className="h-8 w-8 mb-2 stroke-[1.5]" />
        <Typography variant="smallText" className="font-medium">
          {activities.length > 0 ? "No activities match your filters" : "No history recorded yet"}
        </Typography>
      </div>
    );
  }

  const dateGroups = groupIssueActivities(filteredActivities);

  return (
    <TooltipProvider>
      <div className={cn("space-y-12 scrollbar-hide pb-20 md:pb-8", className)}>
        {dateGroups.map((dateGroup) => (
          <div key={dateGroup.dateLabel} className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">
                {dateGroup.dateLabel}
              </span>
              <div className="h-px w-full bg-border/40" />
            </div>
            
            <div className="space-y-8 pl-2">
              {dateGroup.groups.map((group) => (
                <IssueActivityGroup 
                  key={group.id} 
                  group={group} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};
