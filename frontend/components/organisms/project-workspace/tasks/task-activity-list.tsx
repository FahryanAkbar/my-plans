"use client";

import React from "react";
import { History } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { cn, groupTaskActivities } from "@/lib";
import { Typography, TooltipProvider} from "@/components/atoms";
import { TaskActivityGroup, TaskActivitySkeleton } from "../tasks";
import { ActivityFeeds, ActivityAction } from "@/components/organisms";

interface TaskActivityListProps {
  taskId: Id<"tasks">;
  className?: string;
}

export const TaskActivityList = ({ 
  taskId, 
  className 
}: TaskActivityListProps) => {
  const activities = useQuery(api.taskActivity.getByTask, { taskId });

  if (activities === undefined) {
    return <TaskActivitySkeleton />;
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
        <History className="h-8 w-8 mb-2 stroke-[1.5]" />
        <Typography variant="smallText" className="font-medium">
          No history recorded yet
        </Typography>
      </div>
    );
  }

  const formattedActivities: ActivityFeeds[] = activities.map((activity) => ({
    id: activity._id,
    userName: activity.userName,
    userImage: activity.userImage,
    action: activity.action as ActivityAction,
    taskTitle: "",
    oldValue: activity.oldValue,
    newValue: activity.newValue,
    taskId: activity.taskId,
    createdAt: activity.createdAt,
  }));

  const dateGroups = groupTaskActivities(formattedActivities);

  return (
    <TooltipProvider>
      <div className={cn("space-y-12 scrollbar-hide", className)}>
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
                <TaskActivityGroup 
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
