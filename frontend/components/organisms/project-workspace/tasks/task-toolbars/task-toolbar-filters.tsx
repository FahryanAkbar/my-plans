"use client";

import React from "react";
import { Filter } from "lucide-react";
import { 
  Button, 
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Checkbox,
  Typography,
} from "@/components/atoms";
import { cn } from "@/lib";
import { 
  TASK_STATUS, 
  TASK_STATUS_LABELS, 
  TASK_PRIORITY, 
  TASK_PRIORITY_LABELS, 
  TASK_TYPE, 
  TASK_TYPE_LABELS,
  TaskStatus,
  TaskPriority,
  TaskType,
} from "@/lib/constants";
import { TaskFilters } from "@/hooks";
import { tokens } from "@/lib/styles/tokens";
import { patterns, surfaces } from "@/lib/styles/variants";

interface TaskToolbarFiltersProps {
  filters: TaskFilters;
  onFiltersChange?: (filters: TaskFilters) => void;
}

const EMPTY_FILTERS: TaskFilters = { 
  status: [], 
  priority: [], 
  type: [],
  isCreatedByMe: false,
  isAssignedToMe: false,
};

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

export const TaskToolbarFilters = ({
  filters,
  onFiltersChange,
}: TaskToolbarFiltersProps) => {
  const activeFilterCount =
    filters.status.length + 
    filters.priority.length + 
    filters.type.length +
    (filters.isCreatedByMe ? 1 : 0) +
    (filters.isAssignedToMe ? 1 : 0);

  const isFiltered = activeFilterCount > 0;

  const handleStatusToggle = (s: TaskStatus) =>
    onFiltersChange?.({ ...filters, status: toggle(filters.status, s) });

  const handlePriorityToggle = (p: TaskPriority) =>
    onFiltersChange?.({ ...filters, priority: toggle(filters.priority, p) });

  const handleTypeToggle = (t: TaskType) =>
    onFiltersChange?.({ ...filters, type: toggle(filters.type, t) });

  const handleCreatedByMeToggle = () =>
    onFiltersChange?.({ ...filters, isCreatedByMe: !filters.isCreatedByMe });

  const handleAssignedToMeToggle = () =>
    onFiltersChange?.({ ...filters, isAssignedToMe: !filters.isAssignedToMe });

  const handleReset = () => onFiltersChange?.(EMPTY_FILTERS);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs font-medium gap-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Filter className={tokens.size.iconSm} />
          Filter
          {isFiltered && (
            <Badge
              variant="secondary"
              className={cn("ml-0.5 h-4 px-1 text-[10px] border-none", tokens.badge.primary)}
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className={cn("w-70 sm:w-[320px] p-0 flex flex-col overflow-hidden", surfaces.overlay)}
      >
        <div className="flex items-center justify-between px-3 py-2.5 shrink-0 border-b border-border/10 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Filters</span>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="p-3 space-y-3 overflow-y-auto max-h-80 scrollbar-hide">
          <FilterSection 
            title="Status" 
            items={Object.values(TASK_STATUS)} 
            labels={TASK_STATUS_LABELS} 
            selected={filters.status} 
            onToggle={(item) => handleStatusToggle(item as TaskStatus)} 
          />
          <div className="h-px bg-border/50" />
          <FilterSection 
            title="Priority" 
            items={Object.values(TASK_PRIORITY)} 
            labels={TASK_PRIORITY_LABELS} 
            selected={filters.priority} 
            onToggle={(item) => handlePriorityToggle(item as TaskPriority)} 
          />
          <div className="h-px bg-border/50" />
          <FilterSection 
            title="Type" 
            items={Object.values(TASK_TYPE)} 
            labels={TASK_TYPE_LABELS} 
            selected={filters.type} 
            onToggle={(item) => handleTypeToggle(item as TaskType)} 
          />

          <div className="h-px bg-border/50" />

          <div className="space-y-2 pt-1">
            <Typography variant="p" className={patterns.textLabel}>
              My Tasks
            </Typography>
            <div className="grid grid-cols-1 gap-1">
              <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  id="filter-created-by-me"
                  checked={filters.isCreatedByMe}
                  onCheckedChange={handleCreatedByMeToggle}
                  className={tokens.size.iconSm}
                />
                <span className="text-xs text-foreground/80">Created by me</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  id="filter-assigned-to-me"
                  checked={filters.isAssignedToMe}
                  onCheckedChange={handleAssignedToMeToggle}
                  className={tokens.size.iconSm}
                />
                <span className="text-xs text-foreground/80">Assigned to me</span>
              </label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface FilterSectionProps {
  title: string;
  items: string[];
  labels: Record<string, string>;
  selected: string[];
  onToggle: (item: string) => void;
}

const FilterSection = ({ title, items, labels, selected, onToggle }: FilterSectionProps) => (
  <div className="space-y-2">
    <Typography
      variant="p"
      className={cn(patterns.textLabel, "text-[11px] font-black uppercase tracking-wider text-muted-foreground/70")}
    >
      {title}
    </Typography>
    <div className="grid grid-cols-2 gap-1.5">
      {items.map((item) => (
        <label
          key={item}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <Checkbox
            id={`filter-${title.toLowerCase()}-${item}`}
            checked={selected.includes(item)}
            onCheckedChange={() => onToggle(item)}
            className={tokens.size.iconSm}
          />
          <span className="text-xs text-foreground/80">
            {labels[item]}
          </span>
        </label>
      ))}
    </div>
  </div>
);
