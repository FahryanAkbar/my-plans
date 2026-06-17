"use client";

import React from "react";
import { 
  Calendar as CalendarIcon, 
  Clock 
} from "lucide-react";
import { format } from "date-fns";
import { 
  Calendar, 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/atoms";
import { toast } from "sonner";
import { 
  TaskStatus as TaskStatusEnum, 
  TaskPriority as TaskPriorityEnum,
  TASK_STATUS,
  TASK_PRIORITY 
} from "@/lib";
import { cn } from "@/lib/utils";

interface TaskCardDatesProps {
  startDate?: number;
  dueDate?: number;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  onUpdate?: (updates: { dueDate?: number }) => void;
}

export const TaskCardDates = ({
  startDate,
  dueDate,
  status,
  priority,
  onUpdate,
}: TaskCardDatesProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {startDate && (
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/50 bg-muted/30 text-muted-foreground",
          status === TASK_STATUS.IN_PROGRESS && "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
        )}>
          {status === TASK_STATUS.IN_PROGRESS ? <Clock className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
          <span className="text-[10px] font-bold">
            {status === TASK_STATUS.IN_PROGRESS 
              ? `Started ${Math.floor((new Date().getTime() - startDate) / (1000 * 60 * 60 * 24)) === 0 ? "today" : `${Math.floor((new Date().getTime() - startDate) / (1000 * 60 * 60 * 24))}d ago`}`
              : `Start: ${format(startDate, "dd MMM")}`
            }
          </span>
        </div>
      )}
      
      {startDate && dueDate && (
        <div className="text-muted-foreground/30 font-light">—</div>
      )}

      {dueDate && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="outline-none" onClick={(e) => e.stopPropagation()}>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted transition-colors cursor-pointer",
                new Date(dueDate) < new Date() && priority === TASK_PRIORITY.HIGH && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200"
              )}>
                <CalendarIcon className="h-3 w-3" />
                <span className="text-[10px] font-bold">
                  {format(dueDate, "dd MMM yyyy")}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
             <Calendar 
              mode="single"
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
              selected={new Date(dueDate)}
              onSelect={(date) => {
                if (date) {
                  if (startDate && date.getTime() < startDate) {
                    toast.error("Due date cannot be before start date");
                    return;
                  }
                  onUpdate?.({ dueDate: date.getTime() });
                }
              }}
              initialFocus
             />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
