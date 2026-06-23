"use client";

import React, { useMemo, useState } from "react";
import { 
  ArrowRight, 
  Activity, 
  RefreshCw, 
  ChevronDown, 
  Filter, 
  Calendar,
  Layers
} from "lucide-react";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { 
  Typography, 
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction
} from "@/components/atoms";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown/dropdown-menu";
import { OverviewTaskSkeleton } from "@/components/organisms";

import { 
  cn,
  ACTIVITY_CONFIG
} from "@/lib";
import { useRecentActivity } from "@/hooks";
import { api } from "@/convex/_generated/api";
import { groupTaskActivities } from "@/lib/features/task/task-activity";

import { formatDistanceToNow, startOfDay, subWeeks, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { Id } from "@/convex/_generated/dataModel";

export type ActivityAction = keyof typeof ACTIVITY_CONFIG;

export interface ActivityFeeds {
  id: string;
  userName: string;
  userImage?: string;
  action: ActivityAction;
  taskTitle: string;
  oldValue?: string;
  newValue?: string;
  taskId?: Id<"tasks">;
  createdAt: number;
}

const STATUS_PILL_CONFIG: Record<string, { bg: string, text: string, dot: string }> = {
  TODO: { bg: "bg-slate-500/10", text: "text-slate-500", dot: "bg-slate-500" },
  IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  BLOCKED: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  IN_REVIEW: { bg: "bg-purple-500/10", text: "text-purple-500", dot: "bg-purple-500" },
  DONE: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

const StatusPill = ({ status, className }: { status: string, className?: string }) => {
  const config = STATUS_PILL_CONFIG[status as keyof typeof STATUS_PILL_CONFIG] || STATUS_PILL_CONFIG.TODO;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight",
      config.bg,
      config.text,
      className
    )}>
      <span className={cn("w-1 h-1 rounded-full", config.dot)} />
      {status.replace('_', ' ')}
    </span>
  );
};

const ActivityItem = ({ 
  activity, 
  isSubItem = false,
  availableTaskIds,
  onSelectTask,
  subCount = 0,
  isExpanded = false
}: { 
  activity: ActivityFeeds, 
  isSubItem?: boolean,
  availableTaskIds: Set<string>,
  onSelectTask?: (id: Id<"tasks">) => void,
  subCount?: number,
  isExpanded?: boolean
}) => {
  const config = (ACTIVITY_CONFIG)[activity.action] || {
    message: activity.action.replace(/_/g, " "),
    icon: Activity,
    color: "text-muted-foreground",
  };
  
  const hasTaskId = Boolean(activity.taskId);
  const taskExists = hasTaskId && availableTaskIds.has(activity.taskId!.toString());
  const canOpenTask = hasTaskId && taskExists;

  return (
    <div className={cn("space-y-2", isSubItem && "pl-6 relative")}>
      {isSubItem && (
        <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-border/60" />
      )}

      <div className="flex flex-col gap-0.5">
        <Typography className={cn(
          "text-sm font-bold tracking-tight leading-tight",
          isSubItem ? "text-muted-foreground font-black text-[11px] uppercase tracking-tight" : "text-foreground"
        )}>
          {!isSubItem && (
            <>
              {activity.userName}
              <span className="ml-1.5 font-bold text-muted-foreground">
                {config.message}
              </span>
            </>
          )}
          {isSubItem && (
            <span>
              {activity.action === "status_changed" ? "Mengubah status" : config.message}
            </span>
          )}
          {!isSubItem && (
            <span 
              onClick={(e) => {
                e.stopPropagation();
                if (canOpenTask && activity.taskId) {
                  onSelectTask?.(activity.taskId);
                  return;
                }
                toast.error("Task ini sudah dihapus atau tidak tersedia.");
              }}
              className={cn(
                "ml-1.5 font-black transition-all border-b border-transparent",
                canOpenTask
                  ? "text-foreground hover:text-primary cursor-pointer border-border/60 hover:border-primary/50 underline underline-offset-4"
                  : "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {activity.taskTitle}
            </span>
          )}
        </Typography>
      </div>

      {activity.action === "status_changed" && activity.oldValue && activity.newValue && (
        <div className="flex items-center gap-1.5 bg-muted/30 w-fit px-2 py-1 rounded-xl border border-border/40">
          <span className="text-[10px] font-black text-muted-foreground line-through opacity-50">
            {activity.oldValue.replace("_", " ")}
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
          <StatusPill status={activity.newValue} />
        </div>
      )}

      {!isSubItem && (
        <div className="flex items-center gap-x-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
            {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: id })}
          </span>
          {subCount > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground/20">•</span>
              <span className={cn(
                "text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 transition-opacity",
                isExpanded && "opacity-0"
              )}>
                {subCount + 1} {subCount + 1 === 1 ? 'change' : 'changes'}
                <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", isExpanded && "rotate-180")} />
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface RecentActivityFeedProps {
  projectId: Id<"projects">;
  onSelectTask?: (taskId: Id<"tasks">) => void;
  className?: string;
}

export const RecentActivityFeed = ({
  projectId,
  onSelectTask,
  className
}: RecentActivityFeedProps) => {
  const { activities, isLoading, status, loadMore } = useRecentActivity(projectId);
  const projectTasks = useQuery(api.task.getByProject, { projectId });
  const availableTaskIds = useMemo(
    () => new Set((projectTasks || []).map((task) => task._id.toString())),
    [projectTasks]
  );

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("all");

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filter by period
      if (period !== "all") {
        const now = new Date();
        const activityDate = new Date(activity.createdAt);
        if (period === "today") {
          if (activityDate < startOfDay(now)) return false;
        } else if (period === "week") {
          if (activityDate < subWeeks(now, 1)) return false;
        } else if (period === "month") {
          if (activityDate < subMonths(now, 1)) return false;
        }
      }

      // Filter by category
      if (category !== "all") {
        if (category === "status" && activity.action !== "status_changed") return false;
        if (category === "comment" && activity.action !== "commented") return false;
        if (category === "creation" && activity.action !== "created") return false;
      }

      return true;
    });
  }, [activities, period, category]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const groupedDateActivities = useMemo(() => 
    groupTaskActivities(filteredActivities), 
    [filteredActivities]
  );

  if (isLoading) {
    return (
      <OverviewTaskSkeleton 
        variant="feed" 
        titleWidth="w-48" 
        className={className} 
      />
    );
  }

  return (
    <Card className={cn("bg-card border border-border/60 flex flex-col shadow-none", className)}>
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          RECENT ACTIVITY
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          {/* Period Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                {period === "all" ? "All Time" : period}
                <ChevronDown className="h-3 w-3 ml-1 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-50">Filter Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={period} onValueChange={setPeriod}>
                <DropdownMenuRadioItem value="all" className="text-xs">All Time</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="today" className="text-xs">Today</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="week" className="text-xs">Last 7 Days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="month" className="text-xs">Last 30 Days</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <Layers className="h-3 w-3 mr-1.5 opacity-70" />
                {category === "all" ? "Categories" : category}
                <ChevronDown className="h-3 w-3 ml-1 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-50">Filter Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                <DropdownMenuRadioItem value="all" className="text-xs">All Actions</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="status" className="text-xs">Status Changes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="comment" className="text-xs">Comments</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="creation" className="text-xs">New Tasks</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent 
        className="flex-1 overflow-y-auto scrollbar-hide pt-0 pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-10 group">
            <Filter className="h-16 w-16 mb-6 transition-transform group-hover:scale-110 duration-700" />
            <Typography className="text-[11px] font-black uppercase tracking-[0.4em]">
              No activities found
            </Typography>
          </div>
        ) : (
          <div className="space-y-12 py-4">
            {groupedDateActivities.map((dateGroup) => (
              <div key={dateGroup.dateLabel} className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                    {dateGroup.dateLabel}
                  </span>
                  <div className="h-px w-full bg-border/20" />
                </div>

                <div className="space-y-10 pl-2 relative before:absolute before:left-4.25 before:top-10 before:bottom-2 before:w-px before:bg-border/20">
                  {dateGroup.groups.map((group) => {
                    const activity = group.mainActivity;
                    const config = (ACTIVITY_CONFIG)[activity.action] || {
                      message: activity.action.replace(/_/g, " "),
                      icon: Activity,
                      color: "text-muted-foreground",
                    };
                    const Icon = config.icon;
                    const hasSub = group.subActivities.length > 0;
                    const isExpanded = expandedGroups.has(group.id);

                    return (
                      <div 
                        key={group.id} 
                        onClick={() => hasSub && toggleGroup(group.id)}
                        className={cn(
                          "relative pl-14 group/activity transition-colors rounded-2xl py-2",
                          hasSub && "cursor-pointer hover:bg-muted/10"
                        )}
                      >
                        {hasSub && isExpanded && (
                          <div className="absolute left-5.25 top-10 bottom-2 w-px bg-border/40 animate-in fade-in" />
                        )}

                        <div className={cn(
                          "absolute left-2 top-2 h-9 w-9 rounded-full flex items-center justify-center ring-4 ring-background shadow-sm transition-transform group-hover/activity:scale-105 duration-300",
                          config.color.replace("text-", "bg-").replace("500", "500/10"),
                          config.color
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="space-y-4">
                          <ActivityItem 
                            activity={activity} 
                            availableTaskIds={availableTaskIds}
                            onSelectTask={onSelectTask}
                            subCount={group.subActivities.length}
                            isExpanded={isExpanded}
                          />

                          {hasSub && (
                            <div className={cn(
                              "grid transition-all duration-500 ease-in-out",
                              isExpanded ? "grid-rows-[1fr] opacity-100 pt-1" : "grid-rows-[0fr] opacity-0"
                            )}>
                              <div className="overflow-hidden space-y-4">
                                {group.subActivities.map((sub) => (
                                  <ActivityItem 
                                    key={sub.id} 
                                    activity={sub} 
                                    isSubItem={true}
                                    availableTaskIds={availableTaskIds}
                                    onSelectTask={onSelectTask}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {status !== "Exhausted" && (
              <div className="flex justify-center pt-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMore}
                  disabled={status === "LoadingMore"}
                  className="rounded-full px-8 font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-primary/5 hover:text-primary transition-all group"
                >
                  {status === "LoadingMore" ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                  ) : (
                    <Activity className="h-3 w-3 mr-2 group-hover:animate-pulse" />
                  )}
                  {status === "LoadingMore" ? "Loading..." : "Load older activity"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
