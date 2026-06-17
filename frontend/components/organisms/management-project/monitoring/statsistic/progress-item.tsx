"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MessageSquare, Paperclip } from "lucide-react"

import { Progress, Typography, Badge } from "@/components/atoms"
import { AvatarGroup } from "@/components/organisms"
import { getStatusVisualConfig } from "@/lib/constants/feature/task-config"
import { TASK_STATUS, TaskStatus } from "@/lib"

type User = {
  fullName: string
  imageUrl?: string
}

type ProgressItemProps = {
  title: string
  progress: number 
  status?: TaskStatus
  users?: User[]
  dueDate?: string
  comments?: number
  attachments?: number
  className?: string
}

export const ProgressItem = ({
  title,
  progress,
  status,
  users = [],
  dueDate,
  comments,
  attachments,
  className,
}: ProgressItemProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-xl border bg-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Typography variant="smallText" className="text-sm font-semibold leading-none">
              {title}
            </Typography>
            {status && getStatusVisualConfig(status) && (
              <Badge 
                className={cn(
                  "px-1.5 py-0 text-[8px] font-bold border-none shadow-none whitespace-nowrap rounded-full", 
                  getStatusVisualConfig(status).color
                )}
              >
                <div className={cn("w-1 h-1 rounded-full mr-1", status === TASK_STATUS.DONE ? "bg-green-500" : "bg-current")} />
                {getStatusVisualConfig(status).label}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {typeof comments === "number" && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {comments}
              </div>
            )}

            {typeof attachments === "number" && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                {attachments}
              </div>
            )}
          </div>
        </div>

        {users.length > 0 && (
          <AvatarGroup users={users} max={3} />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progress}%</span>
          {dueDate && <span>{dueDate}</span>}
        </div>

        <Progress 
          value={progress} 
          className="h-2" 
          indicatorClassName={cn(
            status === TASK_STATUS.DONE && "bg-green-500",
            status === TASK_STATUS.IN_PROGRESS && "bg-blue-500",
            status === TASK_STATUS.IN_REVIEW && "bg-purple-500",
            status === TASK_STATUS.TODO && "bg-slate-400",
            status === TASK_STATUS.BLOCKED && "bg-red-500",
            !status && "bg-primary"
          )}
        />
      </div>
    </div>
  )
}