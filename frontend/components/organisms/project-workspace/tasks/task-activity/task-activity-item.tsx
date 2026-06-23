"use client";

import React from "react";
import { ArrowRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn, TASK_STATUS, TaskStatus, patterns } from "@/lib";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge, Typography } from "@/components/atoms";
import { ActivityFeeds } from "@/components/organisms";

export interface TaskActivity extends ActivityFeeds {
  field?: string;
}

interface TaskActivityItemProps {
  activity: TaskActivity;
  isSubItem?: boolean;
}

const STATUS_PILL_CONFIG: Record<string, { bg: string, text: string, dot: string }> = {
  [TASK_STATUS.TODO]: { bg: "bg-zinc-500/10", text: "text-zinc-500", dot: "bg-zinc-500" },
  [TASK_STATUS.IN_PROGRESS]: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  [TASK_STATUS.IN_REVIEW]: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  [TASK_STATUS.BLOCKED]: { bg: "bg-rose-500/10", text: "text-rose-500", dot: "bg-rose-500" },
  [TASK_STATUS.DONE]: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

const UserValue = ({ userId }: { userId: string }) => {
  const user = useQuery(api.users.getUserById, { userId: userId as Id<"users"> });
  
  if (user === undefined) return <span className="opacity-50 italic">Loading...</span>;
  if (!user) return <span className="text-muted-foreground italic">Unknown User</span>;
  
  return <span>{user.fullName}</span>;
};

const StatusPill = ({ status, className }: { status: string, className?: string }) => {
  const config = STATUS_PILL_CONFIG[status as TaskStatus] || STATUS_PILL_CONFIG[TASK_STATUS.TODO];
  return (
    <Typography className={cn(
      patterns.badgeBase, 
      patterns.textTinyCaps,
      config.bg,
      config.text,
      className
    )}>
      <span className={cn("w-1 h-1 rounded-full", config.dot)} />
      {status.replace('_', ' ')}
    </Typography>
  );
};

const FIELD_LABELS: Record<string, string> = {
  dueDate: "due date",
  startDate: "start date",
  completedAt: "completion date",
  title: "title",
  description: "description",
  priority: "priority",
  status: "status",
  assigneeId: "assignee",
  assignee: "assignee",
  assignee_id: "assignee",
  reporterId: "reporter",
  watchers: "watchers",
};

const DATE_FIELDS = ["dueDate", "startDate", "completedAt"];

export const TaskActivityItem = ({ activity, isSubItem }: TaskActivityItemProps) => {
  const isCreated = activity.action.toLowerCase() === "created";
  const isStatusChange = activity.action.toLowerCase() === "updated" && activity.field === "status";

  if (isCreated) {
    return (
      <Badge variant="outline" >
        <Plus className="w-3 h-3" />
        Create task
      </Badge>
    );
  }

  if (isStatusChange) {
    return (
      <div className={cn("flex items-center gap-2", isSubItem && "justify-end flex-1")}>
        <div className={patterns.boxSubtle}>
          <Typography className={cn("text-[10px] font-medium", patterns.strikeThrough)}>
            {activity.oldValue?.replace('_', ' ') || "None"}
          </Typography>
          <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
          <StatusPill status={activity.newValue || "TODO"} />
        </div>
      </div>
    );
  }

  const isDateField = DATE_FIELDS.includes(activity.field || "");
  
  const formatValue = (value: string | undefined | null) => {
    if (!value || value === "none" || value === "") return "none";
    
    const isID = (val: string) => /^[a-z0-9]{20,}$/i.test(val);
    const isTimestamp = /^\d{13}$/.test(value);
    if (
      activity.field?.toLowerCase().includes("assignee") || 
      activity.field?.toLowerCase().includes("user") ||
      (isID(value) && !isTimestamp && !value.includes(" "))
    ) {
      return <UserValue userId={value} />;
    }
    
    if (isTimestamp || isDateField) {
      const timestamp = parseInt(value);
      if (!isNaN(timestamp) && timestamp > 946659600000 && timestamp < 4102419600000) {
        try {
          return format(new Date(timestamp), "PPP");
        } catch (e) {
          console.log("Error formatting date:", e);
          return value;
        }
      }
    }
    return value;
  };

  const getLabel = () => {
    const field = activity.field || "";
    if (FIELD_LABELS[field]) return FIELD_LABELS[field];
    if (field.endsWith("Id")) return field.replace("Id", "").toLowerCase();
    if (field.endsWith("_id")) return field.replace("_id", "").toLowerCase();
    return field || "value";
  };

  return (
    <div className="flex items-center gap-1.5">
      <Typography className={patterns.textLabel}>
        Edited {getLabel()}
      </Typography>
      <div className={cn(patterns.boxSubtle, "bg-muted/20 rounded-lg px-2 py-0.5")}>
        <Typography className={cn("text-[10px] font-medium opacity-70", patterns.strikeThrough)}>
          {formatValue(activity.oldValue)}
        </Typography>
        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
        <Typography className="text-[10px] font-bold text-primary italic">
          {formatValue(activity.newValue)}
        </Typography>
      </div>
    </div>
  );
};
