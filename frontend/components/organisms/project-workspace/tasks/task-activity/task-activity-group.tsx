"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";

import { cn, TASK_ACTIVITY_CONFIG, TASK_ACTIVITY_ACTION, patterns } from "@/lib";
import { GroupedTaskActivity } from "@/lib/features";

import { Typography } from "@/components/atoms";
import { TaskActivityItem } from "./task-activity-item";

interface TaskActivityGroupProps {
  group: GroupedTaskActivity;
}

export const TaskActivityGroup = ({ group }: TaskActivityGroupProps) => {
  const action = group.mainActivity.action.toLowerCase();
  
  const configKey = action === "created" ? TASK_ACTIVITY_ACTION.CREATED : 
                    action === "status_changed" ? TASK_ACTIVITY_ACTION.STATUS_CHANGE :
                    action === "priority_changed" ? TASK_ACTIVITY_ACTION.PRIORITY_CHANGE :
                    action === "commented" ? TASK_ACTIVITY_ACTION.COMMENT_ADDED : "DEFAULT";

  const config = TASK_ACTIVITY_CONFIG[configKey as keyof typeof TASK_ACTIVITY_CONFIG] || TASK_ACTIVITY_CONFIG.DEFAULT;
  const Icon = config.icon;

  return (
    <div className="relative pl-12 group/activity">
      {group.subActivities.length > 0 && (
        <div className={cn(patterns.timelineLine, "left-4.5 top-10 bottom-2")} />
      )}

      <div className={cn(
        patterns.timelineIcon,
        "absolute left-0 top-0 transition-transform group-hover/activity:scale-105 duration-300",
        config.color
      )}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex flex-col gap-0.5">
            <Typography className="text-sm font-bold text-foreground tracking-tight">
              {group.userName || "System"}
              <span className="ml-1.5 font-medium text-muted-foreground/60">
                {action === "created" 
                  ? "created this task" 
                  : action === "status_changed"
                  ? "changed status"
                  : action === "priority_changed"
                  ? "changed priority"
                  : action === "commented"
                  ? "added a comment"
                  : "updated the task"}
              </span>
            </Typography>
          </div>

          <TaskActivityItem activity={group.mainActivity} isSubItem={false} />
          
          <span className={cn("block", patterns.textTimestamp)}>
            {formatDistanceToNow(group.timestamp, { addSuffix: true })}
          </span>
        </div>

        {group.subActivities.length > 0 && (
          <div className="space-y-4 pt-1">
            {group.subActivities.map((sub) => {
              const subAction = sub.action.toLowerCase();
              return (
                <div key={sub.id} className="relative pl-6">
                  <div className={cn(patterns.timelineDot, "left-0 top-1.5 w-1.5 h-1.5")} />
                  
                  <div className="space-y-1">
                    <Typography className={cn(patterns.textLabel, "text-muted-foreground/80 lowercase")}>
                      {subAction === "status_changed" ? "Changed status" : 
                       subAction === "priority_changed" ? "Changed priority" :
                       "Updated task"}
                    </Typography>
                    <TaskActivityItem activity={sub} isSubItem={true} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
