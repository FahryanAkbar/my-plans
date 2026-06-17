"use client";

import React from "react";
import { Badge, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { TASK_STATUS } from "@/lib/constants/task";
import { TaskWithDetails } from "@/types/features";

interface TaskDetailTitleProps {
  task: TaskWithDetails;
}

export const TaskDetailTitle = ({ task }: TaskDetailTitleProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider">
          {task.type}
        </Badge>
        <Badge className={cn(
          "text-[10px] font-bold border-none uppercase tracking-wider",
          task.status === TASK_STATUS.DONE ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
          task.status === TASK_STATUS.IN_PROGRESS ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
          "bg-muted text-muted-foreground"
        )}>
          {task.status.replace("_", " ")}
        </Badge>
      </div>
      <Typography className="text-3xl font-bold leading-tight tracking-tight">
        {task.title}
      </Typography>
    </div>
  );
};
