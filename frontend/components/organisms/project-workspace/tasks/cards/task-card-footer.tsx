"use client";

import React from "react";
import { 
  MessageSquare, 
  Paperclip, 
  PlayCircle, 
  Clock,
  Check
} from "lucide-react";
import { Badge } from "@/components/atoms";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/molecules";
import { 
  TaskStatus as TaskStatusEnum, 
  TaskPriority as TaskPriorityEnum, 
  TASK_STATUS, 
  TASK_PRIORITY 
} from "@/lib";
import { getPriorityVisualConfig } from "@/lib/constants/feature/task-config";
import { cn } from "@/lib/utils";

const PRIORITY_TEXT_COLOR: Record<TaskPriorityEnum, string> = {
  [TASK_PRIORITY.LOW]: "text-emerald-400",
  [TASK_PRIORITY.MEDIUM]: "text-amber-400",
  [TASK_PRIORITY.HIGH]: "text-rose-400",
  [TASK_PRIORITY.URGENT]: "text-rose-500",
};

interface TaskCardFooterProps {
  commentsCount: number;
  linksCount: number;
  scoreValue?: number;
  totalActualHours: number;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  onUpdate?: (updates: { priority: TaskPriorityEnum }) => void;
}

export const TaskCardFooter = ({
  commentsCount,
  linksCount,
  scoreValue,
  totalActualHours,
  status,
  priority,
  onUpdate,
}: TaskCardFooterProps) => {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold">{commentsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Paperclip className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold">{linksCount}</span>
        </div>
        {scoreValue !== undefined && (
           <Badge variant="outline" className="h-5 flex items-center px-2 text-[10px] font-bold bg-muted/40 text-muted-foreground/80 border-none shadow-none">
              {scoreValue}pts
           </Badge>
        )}
        <Badge 
          variant="outline"
          className={cn(
            "h-5 flex items-center gap-1.5 px-2 text-[10px] font-bold transition-all border-none shadow-none",
            status === TASK_STATUS.IN_PROGRESS 
             ? "bg-blue-500/10 text-blue-600 animate-pulse" 
             : "bg-primary/5 text-primary"
          )}
        >
           {status === TASK_STATUS.IN_PROGRESS ? (
             <PlayCircle className="h-3 w-3 fill-current" />
           ) : (
             <Clock className="h-3 w-3" />
           )}
           <span>{totalActualHours}hrs</span>
        </Badge>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none" onClick={(e) => e.stopPropagation()}>
            <Badge className={cn("h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all", getPriorityVisualConfig(priority).color)}>
              {priority}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-44 z-50 p-2 rounded-xl border border-border/70 bg-popover/95 backdrop-blur-sm shadow-xl"
        >
          <div className="px-1 pb-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/70">
            Set Priority
          </div>
          <div className="grid grid-cols-2 gap-1">
            {Object.values(TASK_PRIORITY).map((p) => {
              const isActive = p === priority;
              return (
                <DropdownMenuItem 
                  key={p}
                  className={cn(
                    "relative min-h-0 px-2 py-1.5 rounded-md cursor-pointer border transition-all duration-150",
                    "focus:bg-transparent hover:bg-muted/30",
                    isActive ? "border-primary/40 bg-primary/10" : "border-transparent bg-transparent"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate?.({ priority: p as TaskPriorityEnum });
                  }}
                >
                  <span className={cn(
                    "text-[10px] font-bold leading-none",
                    PRIORITY_TEXT_COLOR[p as TaskPriorityEnum]
                  )}>
                    {getPriorityVisualConfig(p).label}
                  </span>
                  {isActive && (
                    <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
