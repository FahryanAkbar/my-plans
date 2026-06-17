"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Typography } from "@/components/atoms";
import { cn } from "@/lib";

interface TaskListColumnHeaderProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export const TaskListColumnHeader = ({ 
  icon: Icon, 
  label, 
  className 
}: TaskListColumnHeaderProps) => (
  <div className={cn("flex items-center min-w-0", className)}>
    <div className="w-6 flex items-center justify-center shrink-0">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <Typography className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </Typography>
  </div>
);
