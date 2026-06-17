"use client";

import React from "react";
import { 
  Checkbox, 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/atoms";
import { Id } from "@/convex/_generated/dataModel";
import { TaskStatus } from "@/lib/constants/task";

interface TaskListItemCheckboxProps {
  id: Id<"tasks">;
  status: TaskStatus;
  isDone: boolean;
  isSelected?: boolean;
  onToggleStatus?: (id: Id<"tasks">, currentStatus: TaskStatus) => void;
  onSelect?: (id: Id<"tasks">, checked: boolean) => void;
}

export const TaskListItemCheckbox = ({
  id,
  status,
  isDone,
  isSelected,
  onToggleStatus,
  onSelect
}: TaskListItemCheckboxProps) => {
  return (
    <React.Fragment>
      <div className="flex justify-center">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(id, !!checked)}
          className="h-3.5 w-3.5 rounded-lg border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      <div className="flex justify-center">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1 hover:bg-primary/10 rounded-md transition-colors cursor-pointer group/checkbox">
                <Checkbox
                  id={`task-status-${id}`}
                  checked={isDone}
                  onCheckedChange={() => onToggleStatus?.(id, status)}
                  className="h-4 w-4 transition-transform active:scale-90 cursor-pointer"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[10px] font-bold">
              {isDone ? "Mark as uncompleted" : "Mark as completed"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </React.Fragment>
  );
};
