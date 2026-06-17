"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";
import { Typography } from "@/components/atoms";
import { TaskWithDetails } from "@/types/features";

interface TaskDetailDescriptionProps {
  task: TaskWithDetails;
}

export const TaskDetailDescription = ({ task }: TaskDetailDescriptionProps) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2 text-muted-foreground/60">
        <LayoutGrid className="h-4 w-4" />
        <Typography variant="smallText" className="font-bold uppercase tracking-[0.2em] text-[10px]">
          Description
        </Typography>
      </div>
      <div className="bg-muted/10 rounded-[2.5rem] p-8 border border-border/40 min-h-48 relative group/desc transition-all duration-500 hover:bg-muted/15 hover:border-border/60">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/desc:opacity-100 transition-opacity duration-700 rounded-[2.5rem]" />
        {task.description ? (
          <Typography className="relative z-10 text-base leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">
            {task.description}
          </Typography>
        ) : (
          <Typography className="relative z-10 text-muted-foreground italic font-normal">
            No description provided for this task.
          </Typography>
        )}
      </div>
    </div>
  );
};
