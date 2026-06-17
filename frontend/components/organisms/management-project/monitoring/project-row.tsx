"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Progress,
} from "@/components/atoms"

import { AvatarGroup } from "@/components/organisms"
import { PlatformBadge } from "./basic-component"

import { 
  ProjectRowProps, 
  statusConfig, 
  progressColor, 
  ActionCell 
} from "./project-shared"

export const getProjectColumns = (
  onView?: (id: Id<"projects">) => void,
  onDelete?: (id: Id<"projects">) => Promise<void>
): ColumnDef<ProjectRowProps>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Project Name",
    meta: {
      headerClassName: "px-4",
      className: "px-4"
    },
    cell: ({ row }) => {
      const project = row.original
      return (
        <div className="flex items-center gap-3 min-w-55">
          <Avatar size="sm" className="shrink-0 border border-border/50">
            {project.projectImage ? (
              <AvatarImage src={project.projectImage} alt={project.name} />
            ) : (
              <AvatarFallback className="bg-muted text-xs">
                {project.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </span>
            {project.description && (
              <span className="text-xs text-muted-foreground truncate max-w-50">
                {project.description}
              </span>
            )}
          </div>
        </div>
      )
    }
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    meta: {
      headerClassName: "text-center",
      className: "text-center min-w-30"
    },
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge className={cn("px-2.5 py-0.5 text-[10px] font-bold border-none shadow-none whitespace-nowrap", statusConfig[status].className)}>
          {statusConfig[status].label}
        </Badge>
      )
    }
  },
  {
    id: "platform",
    accessorKey: "platform",
    header: "Platform",
    meta: {
      headerClassName: "text-center",
      className: "text-center min-w-30"
    },
    cell: ({ row }) => {
      return <PlatformBadge platform={row.original.platform} />
    }
  },
  {
    id: "dueDate",
    accessorKey: "endDate",
    header: "Due Date",
    meta: {
      headerClassName: "text-center",
      className: "text-center min-w-35"
    },
    cell: ({ row }) => {
      const endDate = row.original.endDate
      if (!endDate) return <span className="text-muted-foreground text-xs italic">-</span>

      const date = new Date(endDate)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const isOverdue = diffDays < 0
      const isDueSoon = diffDays >= 0 && diffDays <= 3

      return (
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-sm font-semibold text-foreground">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className={cn(
            "text-[10px] font-medium",
            isOverdue ? "text-destructive" : isDueSoon ? "text-amber-500" : "text-muted-foreground"
          )}>
            {isOverdue 
              ? `${Math.abs(diffDays)} days overdue` 
              : diffDays === 0 
                ? "Due today" 
                : `In ${diffDays} days`}
          </span>
        </div>
      )
    }
  },
  {
    id: "members",
    header: "Team",
    meta: {
      headerClassName: "text-center",
      className: "text-center min-w-30"
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <AvatarGroup users={row.original.members} max={4} />
      </div>
    )
  },
  {
    id: "progress",
    accessorKey: "progress",
    header: "Progress",
    meta: {
      headerClassName: "text-center",
      className: "text-center min-w-45"
    },
    cell: ({ row }) => {
      const { progress, status, totalTasks = 0, completedTasks = 0 } = row.original
      return (
        <div className="flex flex-col gap-2 py-1 items-center justify-center w-full">
          <div className="w-full max-w-35">
            <Progress 
              value={progress} 
              indicatorClassName={cn(
                "transition-all duration-500 ease-in-out",
                progressColor(progress, status)
              )}
              className="h-1.5 bg-muted rounded-full overflow-hidden" 
            />
          </div>
          <div className="flex items-center justify-between w-full max-w-35 px-0.5">
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              {completedTasks}/{totalTasks} tasks
            </span>
            <span className="text-[10px] font-bold text-foreground tabular-nums">
              {progress}%
            </span>
          </div>
        </div>
      )
    }
  },
  {
    id: "actions",
    header: "Actions",
    meta: {
      headerClassName: "text-center px-4",
      className: "text-center px-4 min-w-32"
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ActionCell 
          project={row.original} 
          onView={onView} 
          onDelete={onDelete} 
        />
      </div>
    ),
    enableSorting: false
  }
]
