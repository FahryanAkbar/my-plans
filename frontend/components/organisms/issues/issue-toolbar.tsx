"use client";

import React from "react";
import { 
  Search, 
  Filter, 
  Layers, 
  History,
  Zap,
  Archive,
} from "lucide-react";

import { 
  Badge,
  Input,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Typography,
  Button, 
} from "@/components/atoms";
import { cn, stripHtml } from "@/lib";
import { 
  ISSUE_STATUS_LABELS, 
  ISSUE_PRIORITY_LABELS, 
  ISSUE_SEVERITY_LABELS 
} from "@/lib/constants";
import { useDebounce } from "@/hooks";

export type IssueView = "board" | "list" | "activity";

interface IssueToolbarProps {
  activeView: IssueView;
  onViewChange: (view: IssueView) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onGroupChange?: (value: string) => void;
  showArchived?: boolean;
  onToggleArchived?: () => void;
  selectedFilters?: {
    status: string[];
    priority: string[];
    severity: string[];
    isCreatedByMe: boolean;
    isAssignedToMe: boolean;
  };
  onFiltersChange?: (filters: {
    status: string[];
    priority: string[];
    severity: string[];
    isCreatedByMe: boolean;
    isAssignedToMe: boolean;
  }) => void;
  className?: string;
}

interface FilterPopoverProps {
  activeFilterCount: number;
  selectedFilters: {
    status: string[];
    priority: string[];
    severity: string[];
    isCreatedByMe: boolean;
    isAssignedToMe: boolean;
  };
  onFiltersChange?: (filters: {
    status: string[];
    priority: string[];
    severity: string[];
    isCreatedByMe: boolean;
    isAssignedToMe: boolean;
  }) => void;
  handleFilterToggle: (category: 'status' | 'priority' | 'severity', value: string) => void;
  handleCreatedByMeToggle: () => void;
  handleAssignedToMeToggle: () => void;
}

const FilterPopover = ({ 
  activeFilterCount, 
  selectedFilters, 
  onFiltersChange, 
  handleFilterToggle, 
  handleCreatedByMeToggle, 
  handleAssignedToMeToggle 
}: FilterPopoverProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex-1 sm:flex-none h-9 text-xs font-medium gap-2 text-muted-foreground hover:text-foreground border border-border/50 sm:border-transparent shrink-0"
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Filter</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px] bg-primary/10 text-primary border-none">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent 
      className="w-70 sm:w-[320px] p-0 flex flex-col overflow-hidden bg-popover border-border shadow-xl rounded-xl" 
      align="start" 
      side="bottom"
      sideOffset={8}
      collisionPadding={24}
    >
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0 border-b border-border/10 bg-muted/20">
        <Typography variant="h6" className="text-xs font-semibold text-foreground">Filters</Typography>
        {activeFilterCount > 0 && (
          <button 
            onClick={() =>
              onFiltersChange?.({
                status: [],
                priority: [],
                severity: [],
                isCreatedByMe: false,
                isAssignedToMe: false,
              })
            }
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="p-3 space-y-4 overflow-y-auto max-h-80 scrollbar-hide">
        <div className="space-y-3">
          <Typography className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Status</Typography>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ISSUE_STATUS_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center gap-2 group cursor-pointer" onClick={() => handleFilterToggle('status', value)}>
                <Checkbox 
                  checked={selectedFilters.status.includes(value)}
                  onCheckedChange={() => handleFilterToggle('status', value)}
                  id={`status-${value}`}
                  className="size-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor={`status-${value}`}
                  className="text-xs font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="space-y-3">
          <Typography className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Priority</Typography>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ISSUE_PRIORITY_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center gap-2 group cursor-pointer" onClick={() => handleFilterToggle('priority', value)}>
                <Checkbox 
                  checked={selectedFilters.priority.includes(value)}
                  onCheckedChange={() => handleFilterToggle('priority', value)}
                  id={`priority-${value}`}
                  className="size-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor={`priority-${value}`}
                  className="text-xs font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                >
                  {label.split(' - ')[0]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="space-y-3">
          <Typography className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Severity</Typography>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ISSUE_SEVERITY_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center gap-2 group cursor-pointer" onClick={() => handleFilterToggle('severity', value)}>
                <Checkbox 
                  checked={selectedFilters.severity.includes(value)}
                  onCheckedChange={() => handleFilterToggle('severity', value)}
                  id={`severity-${value}`}
                  className="size-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor={`severity-${value}`}
                  className="text-xs font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="space-y-3">
          <Typography className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">My Tasks</Typography>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleCreatedByMeToggle}>
              <Checkbox
                checked={selectedFilters.isCreatedByMe}
                onCheckedChange={handleCreatedByMeToggle}
                id="my-tasks-created-by-me"
                className="size-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="my-tasks-created-by-me"
                className="text-xs font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
              >
                Created by me
              </label>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleAssignedToMeToggle}>
              <Checkbox
                checked={selectedFilters.isAssignedToMe}
                onCheckedChange={handleAssignedToMeToggle}
                id="my-tasks-assigned-to-me"
                className="size-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="my-tasks-assigned-to-me"
                className="text-xs font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors"
              >
                Assigned to me
              </label>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

export const IssueToolbar = ({
  activeView,
  onViewChange,
  searchTerm = "",
  onSearchChange,
  showArchived,
  onToggleArchived,
  selectedFilters = {
    status: [],
    priority: [],
    severity: [],
    isCreatedByMe: false,
    isAssignedToMe: false,
  },
  onFiltersChange,
  className
}: IssueToolbarProps) => {
  const activeFilterCount = 
    selectedFilters.status.length + 
    selectedFilters.priority.length + 
    selectedFilters.severity.length +
    (selectedFilters.isCreatedByMe ? 1 : 0) +
    (selectedFilters.isAssignedToMe ? 1 : 0);

  const handleFilterToggle = (category: 'status' | 'priority' | 'severity', value: string) => {
    if (!onFiltersChange) return;

    const current = [...selectedFilters[category]];
    const index = current.indexOf(value);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }

    onFiltersChange({
      ...selectedFilters,
      [category]: current
    });
  };
  
  const handleCreatedByMeToggle = () => {
    if (!onFiltersChange) return;
    onFiltersChange({
      ...selectedFilters,
      isCreatedByMe: !selectedFilters.isCreatedByMe,
    });
  };

  const handleAssignedToMeToggle = () => {
    if (!onFiltersChange) return;
    onFiltersChange({
      ...selectedFilters,
      isAssignedToMe: !selectedFilters.isAssignedToMe,
    });
  };
  const [localSearch, setLocalSearch] = React.useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  React.useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  React.useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearchChange?.(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchTerm]);

  return (
    <div className={cn("flex flex-col gap-y-4 py-2 sm:py-3", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide gap-4 sm:gap-6 h-10 px-4">
          {[
            { value: "board", label: "Board", icon: <Layers className="h-4 w-4 shrink-0" /> },
            { value: "list", label: "Logs", icon: <Zap className="h-4 w-4 shrink-0" /> },
            { value: "activity", label: "Activity", icon: <History className="h-4 w-4 shrink-0" /> },
          ].map((view) => (
            <button
              key={view.value}
              onClick={() => onViewChange(view.value as IssueView)}
              className={cn(
                "group flex items-center gap-2 h-full px-1 text-sm font-semibold transition-all relative shrink-0",
                activeView === view.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {view.icon}
              <span className="whitespace-nowrap">{view.label}</span>
              {activeView === view.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 md:pr-4 md:pl-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search issues..." 
                value={localSearch}
                maxLength={40}
                onChange={(e) => setLocalSearch(stripHtml(e.target.value))}
                className="pl-9 h-9 w-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-xs"
              />
            </div>
            
            <div className="sm:hidden block">
              <FilterPopover 
                activeFilterCount={activeFilterCount}
                selectedFilters={selectedFilters}
                onFiltersChange={onFiltersChange}
                handleFilterToggle={handleFilterToggle}
                handleCreatedByMeToggle={handleCreatedByMeToggle}
                handleAssignedToMeToggle={handleAssignedToMeToggle}
              />
            </div>
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="hidden sm:block">
              <FilterPopover 
                activeFilterCount={activeFilterCount}
                selectedFilters={selectedFilters}
                onFiltersChange={onFiltersChange}
                handleFilterToggle={handleFilterToggle}
                handleCreatedByMeToggle={handleCreatedByMeToggle}
                handleAssignedToMeToggle={handleAssignedToMeToggle}
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleArchived}
              className={cn(
                "flex-1 sm:flex-none h-9 text-xs font-medium gap-2 transition-all rounded-lg border border-border/50 sm:border-transparent",
                showArchived 
                  ? "bg-primary/10 text-primary hover:bg-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
