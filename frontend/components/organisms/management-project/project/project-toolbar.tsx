'use client'

import * as React from 'react'
import { 
  Search, 
  ChevronDown, 
  Archive, 
  ArrowUpDown, 
  SortAsc, 
  SortDesc,
  Clock,
  BarChart2,
  Type
} from "lucide-react"

import { cn } from '@/lib'
import { stripHtml } from '@/lib/utils'
import { Typography, Input, Button } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/molecules"
import { SortConfig, useDebounce } from '@/hooks'

export interface ProjectToolbarProps<T extends object> {
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  label?: string

  tabs?: { 
    label: string; 
    value: string; 
    icon?: React.ReactNode;
    count?: number;
    color?: string;
  }[]
  activeTab?: string
  onTabChange?: (value: string) => void
  searchTerm?: string
  onSearchChange?: (value: string) => void
  sortConfig?: SortConfig<T>
  onSortChange?: (key: keyof T) => void
  sortOptions?: { label: string; key: keyof T; icon?: React.ReactNode }[]
  filterOptions?: { label: string; value: string; color?: string; count?: number }[]
  activeFilter?: string
  onFilterClick?: (value: string) => void
  onClearFilters?: () => void
  viewMode?: "list" | "grid"
  onViewModeChange?: (mode: "list" | "grid") => void

  className?: string
}

export const ProjectToolbar = <T extends object>({
  leftSection,
  rightSection,
  label,
  tabs,
  activeTab,
  onTabChange,
  searchTerm = "",
  onSearchChange,
  sortConfig,
  onSortChange,
  sortOptions = [],
  filterOptions = [],
  activeFilter,
  onFilterClick,
  className,
}: ProjectToolbarProps<T>) => {
  const [localSearch, setLocalSearch] = React.useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 300);

  React.useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  React.useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearchChange?.(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchTerm]);

  const activeSortLabel = React.useMemo(() => {
    if (!sortConfig) return "Sort By";
    const option = sortOptions.find(opt => opt.key === sortConfig.key);
    return option?.label || String(sortConfig.key);
  }, [sortConfig, sortOptions]);

  const getSortIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'name': return <Type className="w-3.5 h-3.5" />;
      case 'status': return <Clock className="w-3.5 h-3.5" />;
      case 'progress': return <BarChart2 className="w-3.5 h-3.5" />;
      default: return <ArrowUpDown className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 w-full",
        className
      )}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
        {label && !leftSection && (
          <Typography variant="smallText" className="text-muted-foreground mr-2 shrink-0">
            {label}
          </Typography>
        )}

        {leftSection ?? (
          <div className="flex items-center gap-6 shrink-0 h-10 px-1">
            {tabs ? tabs.map(tab => (
              <Button
                variant="ghost"
                key={tab.value}
                onClick={() => onTabChange?.(tab.value)}
                className={cn(
                  "group flex items-center gap-2 h-full px-1 text-sm font-semibold transition-all relative",
                  activeTab === tab.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors",
                    activeTab === tab.value 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                  )}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                )}
              </Button>
            )) : (
              <div className="flex items-center gap-6 h-full px-1">
                <Button
                  variant="ghost"
                  onClick={() => onTabChange?.("all")}
                  className={cn(
                    "flex items-center gap-2 h-full px-1 text-sm font-semibold transition-all relative",
                    activeTab === "all" || !activeTab
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All projects
                  {activeTab === "all" || !activeTab ? (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  ) : null}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onTabChange?.("archived")}
                  className={cn(
                    "flex items-center gap-2 h-full px-1 text-sm font-semibold transition-all relative",
                    activeTab === "archived"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Archive className="w-4 h-4" />
                  Archived
                  {activeTab === "archived" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {rightSection ?? (
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
           
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </span>
              <Input
                value={localSearch}
                maxLength={50}
                type="text"
                onChange={(e) => setLocalSearch(stripHtml(e.target.value))}
                placeholder="Search..."
                className="pl-9 pr-4 h-9 text-sm rounded-md border bg-background w-full sm:w-50 focus-visible:ring-1 transition-all focus:border-primary/50 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 w-full sm:w-40 px-3 text-muted-foreground hover:bg-muted rounded-md transition-all flex items-center justify-between border border-border/60 hover:text-foreground shadow-sm bg-background/50 backdrop-blur-sm group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                         <ArrowUpDown className={cn(
                           "w-3.5 h-3.5 transition-colors shrink-0",
                           sortConfig ? "text-primary" : "opacity-40"
                         )} />
                         <Typography variant="smallText" className={cn(
                           "font-semibold truncate",
                           !sortConfig && "opacity-60"
                         )}>
                           {sortConfig ? activeSortLabel : "Sort"}
                         </Typography>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sortConfig && (
                          <span className="text-[9px] font-black bg-primary/10 text-primary px-1 rounded leading-none uppercase tracking-tighter hidden sm:inline-block">
                            {sortConfig.direction}
                          </span>
                        )}
                        <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl border-border/40 bg-popover/95 backdrop-blur-md">
                    <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                      Sort Projects By
                    </div>
                    <div className="space-y-0.5">
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={String(option.key)}
                          onClick={() => onSortChange?.(option.key)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-colors group",
                            sortConfig?.key === option.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {getSortIcon(String(option.key))}
                            </div>
                            <span className="text-sm">{option.label}</span>
                          </div>
                          
                          {sortConfig?.key === option.key && (
                            <div className="flex items-center">
                              {sortConfig.direction === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                              ) : (
                                <SortDesc className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    
                    {sortOptions.length > 0 && (
                      <>
                        <DropdownMenuSeparator className="my-1.5 opacity-50" />
                        <DropdownMenuItem 
                          onClick={() => onSortChange?.(sortOptions[0].key)} 
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-lg group"
                        >
                          <ArrowUpDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span>Default Sort</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {filterOptions.length > 0 && (
                <div className="flex-1 sm:flex-none">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-9 w-full sm:w-40 px-3 text-muted-foreground hover:bg-muted rounded-md transition-all flex items-center justify-between border border-border/60 hover:text-foreground shadow-sm bg-background/50 backdrop-blur-sm group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                           {activeFilter !== "all" && activeFilter ? (
                             <span className={cn(
                               "w-1.5 h-1.5 rounded-full shrink-0",
                               filterOptions.find(o => o.value === activeFilter)?.color || "bg-primary"
                             )} />
                           ) : (
                             <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                           )}
                          <Typography variant="smallText" className={cn(
                            "font-semibold truncate",
                            (activeFilter === "all" || !activeFilter) && "opacity-60"
                          )}>
                            {activeFilter === "all" || !activeFilter 
                              ? "Status" 
                              : filterOptions.find(o => o.value === activeFilter)?.label || activeFilter
                            }
                          </Typography>
                        </div>
                        <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl border-border/40 bg-popover/95 backdrop-blur-md">
                      <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                        Filter by Status
                      </div>
                      <div className="space-y-0.5">
                        {filterOptions.map(opt => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() => onFilterClick?.(opt.value)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-colors group",
                              activeFilter === opt.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2.5 h-2.5 rounded-full border-2 border-background shadow-sm shrink-0",
                                opt.color || "bg-muted-foreground/30"
                              )} />
                              <span className="text-sm">{opt.label}</span>
                            </div>
                            
                            {opt.count !== undefined && (
                              <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-5 text-center transition-colors",
                                activeFilter === opt.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                              )}>
                                {opt.count}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>

                      <DropdownMenuSeparator className="my-1.5 opacity-50" />
                      
                      <DropdownMenuItem 
                        onClick={() => onFilterClick?.("all")} 
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg group"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive/20 border border-destructive/30 shrink-0 group-hover:bg-destructive/40 transition-colors" />
                        <span>Reset Status Filter</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}