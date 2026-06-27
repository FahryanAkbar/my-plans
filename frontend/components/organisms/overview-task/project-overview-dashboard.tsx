/* eslint-disable react-hooks/purity */
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  CircleDot,
  FilterX,
  Eye,
  Timer
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useProjectHealth } from "@/hooks";
import { 
  Typography, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  Badge,
  Button
} from "@/components/atoms";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/molecules/pagination/pagination";
import { cn } from "@/lib/utils";
import { PaginationMeta } from "@/types/api/api";

interface ProjectOverviewDashboardProps {
  projectId: Id<"projects">;
  onSelectTask?: (taskId: Id<"tasks">) => void;
  className?: string;
}

const STATUS_CONFIG: Record<string, { color: string, icon: React.ComponentType<{ className?: string }> }> = {
  TODO: { color: "bg-neutral/10 text-neutral-foreground dark:bg-neutral/20 dark:text-neutral-foreground border-neutral/20", icon: Clock },
  IN_PROGRESS: { color: "bg-info/10 text-info dark:bg-info/20 dark:text-info-foreground border-info/20", icon: CircleDot },
  IN_REVIEW: { color: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground border-secondary/20", icon: ArrowUpRight },
  BLOCKED: { color: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-foreground border-danger/20", icon: AlertCircle },
  DONE: { color: "bg-success/10 text-success dark:bg-success/20 dark:text-success-foreground border-success/20", icon: CheckCircle2 },
};

const ITEMS_PER_PAGE = 10;
const URGENT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days

export const ProjectOverviewDashboard = ({
  projectId,
  onSelectTask,
  className
}: ProjectOverviewDashboardProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isUrgentFilterActive, setIsUrgentFilterActive] = useState(false);
  
  const healthData = useProjectHealth(projectId);
  const tasks = useQuery(api.task.getByProject, { projectId });
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const completionPercentage = healthData.totalTasks > 0 
    ? Math.round((healthData.doneCount / healthData.totalTasks) * 100) 
    : 0;

  const now = Date.now();

  const urgentTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      if (task.status === "DONE") return false;
      if (!task.dueDate) return false;
      const timeToDue = task.dueDate - now;
      return timeToDue > 0 && timeToDue <= URGENT_THRESHOLD_MS;
    });
  }, [tasks, now]);

  const paginationResult = useMemo(() => {
    if (!tasks) return { data: [], meta: null };
    
    let processedTasks = [...tasks].sort((a, b) => b._creationTime - a._creationTime);

    if (isUrgentFilterActive) {
      processedTasks = processedTasks.filter(task => {
        if (task.status === "DONE") return false;
        if (!task.dueDate) return false;
        const timeToDue = task.dueDate - now;
        return timeToDue > 0 && timeToDue <= URGENT_THRESHOLD_MS;
      });
    }

    const totalElement = processedTasks.length;
    const totalPage = Math.ceil(totalElement / ITEMS_PER_PAGE) || 1;
    
    const meta: PaginationMeta = {
      current_page: currentPage,
      total_page: totalPage,
      total_element: totalElement,
      size: ITEMS_PER_PAGE
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = processedTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      data: paginatedData,
      meta
    };
  }, [tasks, currentPage, isUrgentFilterActive, now]);

  const handlePageChange = (page: number) => {
    if (!paginationResult.meta) return;
    if (page < 1 || page > paginationResult.meta.total_page) return;
    setCurrentPage(page);
  };

  const toggleUrgentFilter = () => {
    setIsUrgentFilterActive(!isUrgentFilterActive);
    setCurrentPage(1); 
  };

  return (
    <div className={cn("flex flex-col gap-y-0 bg-card border border-border rounded-2xl overflow-hidden shadow-none", className)}>
      {urgentTasks.length > 0 && (
        <div className={cn(
          "px-4 md:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4 animate-in fade-in slide-in-from-top-2 duration-700",
          isUrgentFilterActive 
            ? "bg-primary/10 border-b border-primary/20" 
            : "bg-warning/10 dark:bg-warning/8 border-b border-warning/20 dark:border-warning/20 backdrop-blur-md"
        )}>
          <div className="flex items-start sm:items-center gap-3 md:gap-4">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-none",
              isUrgentFilterActive 
                ? "bg-primary/20 text-primary dark:text-primary-foreground" 
                : "bg-warning/20 dark:bg-warning/20 text-warning dark:text-warning"
            )}>
              {isUrgentFilterActive ? <Eye className="h-5 w-5" /> : <Timer className="h-5 w-5 animate-pulse" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <Typography className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                isUrgentFilterActive ? "text-primary dark:text-primary" : "text-warning dark:text-warning"
              )}>
                {isUrgentFilterActive ? "PRIORITY VIEW ENABLED" : "PRIORITY ATTENTION"}
              </Typography>
              <Typography className={cn(
                "text-xs font-medium tracking-tight transition-colors",
                isUrgentFilterActive ? "text-primary/80 dark:text-primary/90" : "text-warning/80 dark:text-warning/80"
              )}>
                {isUrgentFilterActive 
                  ? `Currently reviewing ${urgentTasks.length} tasks with critical deadlines.`
                  : `Detected ${urgentTasks.length} task${urgentTasks.length > 1 ? 's' : ''} approaching deadline within 7 days.`
                }
              </Typography>
            </div>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={toggleUrgentFilter}
            className={cn(
              "h-9 w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest px-5 rounded-lg border-none transition-all duration-300 shadow-none shrink-0",
              isUrgentFilterActive 
                ? "bg-primary text-primary-foreground dark:text-white hover:bg-primary/90" 
                : "bg-warning/10 dark:bg-warning/20 text-warning dark:text-warning-foreground hover:bg-warning/20 dark:hover:bg-warning/30"
            )}
          >
            {isUrgentFilterActive ? (
              <div className="flex items-center gap-2">
                <FilterX className="h-3.5 w-3.5" />
                Show All
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                Review Tasks
              </div>
            )}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-b border-border">
        <div className="p-4 md:p-6 flex flex-col gap-2 bg-card">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            COMPLETION
          </Typography>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <Typography className="text-xl md:text-2xl font-bold tracking-tight">
                {completionPercentage}%
              </Typography>
              <Typography className="text-[9px] md:text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-tighter">
                {healthData.doneCount}/{healthData.totalTasks} tasks
              </Typography>
            </div>
            <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Done */}
        <div className="p-4 md:p-6 flex flex-col gap-2 bg-card">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            DONE
          </Typography>
          <div className="flex flex-col">
            <Typography className="text-xl md:text-2xl font-bold tracking-tight">
              {healthData.doneCount}
            </Typography>
            <Typography className="text-[9px] md:text-[10px] font-medium text-muted-foreground/60">
              of {healthData.totalTasks} tasks
            </Typography>
          </div>
        </div>

        <div className="p-4 md:p-6 flex flex-col gap-2 bg-card">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            IN PROGRESS
          </Typography>
          <div className="flex flex-col">
            <Typography className="text-xl md:text-2xl font-bold tracking-tight">
              {healthData.inProgressCount + healthData.inReviewCount}
            </Typography>
            <Typography className="text-[9px] md:text-[10px] font-medium text-muted-foreground/60">
              task active
            </Typography>
          </div>
        </div>
        <div className="p-4 md:p-6 flex flex-col gap-2 bg-card">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            OVERDUE
          </Typography>
          <div className="flex flex-col">
            <Typography className={cn(
              "text-xl md:text-2xl font-bold tracking-tight",
              healthData.overdueCount > 0 ? "text-red-500" : "text-foreground"
            )}>
              {healthData.overdueCount}
            </Typography>
            <Typography className="text-[9px] md:text-[10px] font-medium text-muted-foreground/60">
              {healthData.overdueCount > 0 ? "needs attention" : "all on track"}
            </Typography>
          </div>
        </div>
      </div>
      <div className="hidden md:grid grid-cols-12 px-10 py-3 bg-muted/10 border-b border-border">
        <div className="col-span-6">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            TASK {isUrgentFilterActive && <span className="text-primary font-black ml-2 animate-pulse">• URGENT FOCUS</span>}
          </Typography>
        </div>
        <div className="col-span-2">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            ASSIGNEE
          </Typography>
        </div>
        <div className="col-span-2 text-center">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            STATUS
          </Typography>
        </div>
        <div className="col-span-2 text-center">
          <Typography className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            DUE DATE
          </Typography>
        </div>
      </div>

      <div className="divide-y divide-border/60 h-auto md:h-160 flex flex-col overflow-hidden">
        {(!paginationResult.data || paginationResult.data.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40">
            <div className="relative h-32 w-32 grayscale opacity-50">
              <Image 
                src="/empty.png" 
                alt="No tasks" 
                fill 
                className="object-contain"
              />
            </div>
            <Typography className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {isUrgentFilterActive ? "No urgent tasks matching filter" : "No tasks found in this project"}
            </Typography>
          </div>
        ) : (
          <>
            {paginationResult.data.map((task) => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
              const Icon = status.icon;
              
              const firstAssignee = task.assigneeDetails?.[0];
              const assigneeName = firstAssignee?.fullName;
              const assigneeImage = firstAssignee?.imageUrl;

              const timeToDue = task.dueDate ? task.dueDate - now : 0;
              const isH7 = task.dueDate && timeToDue > 0 && timeToDue <= URGENT_THRESHOLD_MS && task.status !== "DONE";
              
              const isPersonalUrgent = isH7 && currentUser && task.assigneeId === currentUser._id;

              return (
                <div 
                  key={task._id}
                  onClick={() => onSelectTask?.(task._id)}
                  className="flex flex-col md:grid md:grid-cols-12 px-4 md:px-10 py-3 md:py-0 md:h-16 md:items-center hover:bg-muted/30 transition-colors cursor-pointer group shrink-0 gap-y-3 md:gap-y-0 border-b border-border/40 md:border-none"
                >
                  <div className="md:col-span-6 flex flex-col md:pr-4 min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <Typography className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                        {task.title}
                      </Typography>
                      {isPersonalUrgent && (
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" title="Your Task: Due Soon" />
                      )}
                      {isH7 && !isPersonalUrgent && (
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500/40 shrink-0" title="Project Task: Due Soon" />
                      )}
                    </div>
                    <Typography className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {task.status === "DONE" 
                        ? `Completed ${formatDistanceToNow(task.completedAt || task._creationTime, { addSuffix: true })}`
                        : `Created ${formatDistanceToNow(task._creationTime, { addSuffix: true })}`
                      }
                    </Typography>
                  </div>

                  <div className="flex items-center justify-between md:hidden w-full pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 border border-background shadow-sm">
                        {assigneeImage && <AvatarImage src={assigneeImage} />}
                        <AvatarFallback className="text-[7px] font-bold bg-muted text-muted-foreground">
                          {assigneeName?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <Typography className="text-[10px] font-medium truncate max-w-20">
                        {assigneeName || "Unassigned"}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Typography className={cn(
                        "text-[10px] font-medium",
                        task.dueDate && task.dueDate < now && task.status !== "DONE" 
                          ? "text-red-500 font-bold" 
                          : isH7
                          ? "text-amber-600 dark:text-amber-400 font-bold"
                          : "text-muted-foreground/70"
                      )}>
                        {task.dueDate ? format(task.dueDate, "MMM d") : ""}
                      </Typography>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 border-none",
                          status.color
                        )}
                      >
                        <Icon className="h-2 w-2" />
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="hidden md:flex col-span-2 items-center gap-2">
                    <Avatar className="h-6 w-6 border border-background shadow-sm">
                      {assigneeImage && <AvatarImage src={assigneeImage} />}
                      <AvatarFallback className="text-[8px] font-bold bg-muted text-muted-foreground">
                        {assigneeName?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <Typography className="text-[11px] font-medium truncate max-w-20">
                      {assigneeName || "Unassigned"}
                    </Typography>
                  </div>

                  <div className="hidden md:flex col-span-2 justify-center">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-none",
                        status.color
                      )}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="hidden md:block col-span-2 text-center">
                    <Typography className={cn(
                      "text-[11px] font-medium",
                      task.dueDate && task.dueDate < now && task.status !== "DONE" 
                        ? "text-red-500 font-bold" 
                        : isH7
                        ? "text-amber-600 dark:text-amber-400 font-bold"
                        : "text-muted-foreground/70"
                    )}>
                      {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : "-"}
                    </Typography>
                  </div>
                </div>
              );
            })}
            
            {paginationResult.data.length < ITEMS_PER_PAGE && (
              Array.from({ length: ITEMS_PER_PAGE - paginationResult.data.length }).map((_, i) => (
                <div key={`filler-${i}`} className="h-16 border-none" />
              ))
            )}
          </>
        )}
      </div>

      {/* FOOTER WITH STANDARDIZED PAGINATION */}
      <div className="px-4 md:px-10 py-3 md:py-3 bg-muted/5 border-t border-border flex flex-col md:flex-row items-center justify-between gap-y-4">
        <Typography className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center md:text-left">
          {paginationResult.meta ? (
            `Showing ${paginationResult.data.length} of ${paginationResult.meta.total_element} tasks ${isUrgentFilterActive ? '(Filtered)' : ''}`
          ) : (
            "End of overview"
          )}
        </Typography>

        {paginationResult.meta && paginationResult.meta.total_page > 1 && (
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={cn(
                    "h-8 text-[10px] font-bold uppercase tracking-widest",
                    currentPage === 1 && "pointer-events-none opacity-40"
                  )}
                  text="Prev"
                />
              </PaginationItem>
              
              {Array.from({ length: paginationResult.meta.total_page }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 || 
                  page === paginationResult.meta!.total_page || 
                  Math.abs(page - currentPage) <= 1
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                        className="h-8 w-8 text-[10px] font-bold"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (Math.abs(page - currentPage) === 2) {
                  return (
                    <PaginationItem key={page}>
                      <span className="text-[10px] px-1 opacity-40">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={cn(
                    "h-8 text-[10px] font-bold uppercase tracking-widest",
                    currentPage === paginationResult.meta.total_page && "pointer-events-none opacity-40"
                  )}
                  text="Next"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

    </div>
  );
};
