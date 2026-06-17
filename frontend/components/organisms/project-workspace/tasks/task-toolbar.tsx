"use client";

import React from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/atoms";
import { 
  TaskToolbarViewTabs, 
  TaskView,
  TaskToolbarSearch,
  TaskToolbarFilters
} from "./task-toolbars";

import { cn } from "@/lib";
import { TaskFilters } from "@/hooks";
import { tokens } from "@/lib/styles";

interface TaskToolbarProps {
  activeView: TaskView;
  onViewChange: (view: TaskView) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  filters?: TaskFilters;
  onFiltersChange?: (filters: TaskFilters) => void;
  onGroupChange?: (value: string) => void;
  showArchived?: boolean;
  onShowArchivedChange?: (value: boolean) => void;
  className?: string;
}

const EMPTY_FILTERS: TaskFilters = { 
  status: [], 
  priority: [], 
  type: [],
  isCreatedByMe: false,
  isAssignedToMe: false,
};

export const TaskToolbar = ({
  activeView,
  onViewChange,
  searchTerm,
  onSearchChange,
  filters = EMPTY_FILTERS,
  onFiltersChange,
  showArchived,
  onShowArchivedChange,
  className
}: TaskToolbarProps) => {
  return (
    <div className={cn("flex flex-col gap-y-4 py-2 w-full", className)}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
        <TaskToolbarViewTabs 
          activeView={activeView} 
          onViewChange={onViewChange} 
        />

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <TaskToolbarSearch 
                searchTerm={searchTerm} 
                onSearchChange={onSearchChange} 
              />
            </div>
            <div className="sm:hidden block">
              <TaskToolbarFilters 
                filters={filters} 
                onFiltersChange={onFiltersChange} 
              />
            </div>
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="hidden sm:block">
              <TaskToolbarFilters 
                filters={filters} 
                onFiltersChange={onFiltersChange} 
              />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShowArchivedChange?.(!showArchived)}
              className={cn(
                "h-9 text-xs font-medium gap-2 transition-all duration-200 shrink-0 w-full sm:w-auto border sm:border-none",
                showArchived 
                  ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-dark border-primary/20" 
                  : "text-muted-foreground hover:text-foreground border-border"
              )}
            >
              <Archive className={cn(tokens.size.iconSm, showArchived && "fill-current")} />
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
