"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  Calendar,
  ZoomIn,
  Target,
} from "lucide-react";

import { TaskCardProps } from "@/components/organisms";
import { Button, Skeleton, Typography } from "@/components/atoms";

import { TASK_STATUS, TaskStatus, PERMISSIONS, cn, patterns } from "@/lib";
import { useProjectPermission } from "@/hooks";
import { Id } from "@/convex/_generated/dataModel";

import "./task-timeline.css";

interface GanttTask {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  progress: number;
  status: TaskStatus;
  open: boolean;
  parent?: string | number;
  readonly?: boolean;
  isGroup?: boolean;
}

interface TaskTimelineProps {
  projectId: Id<"projects">;
  tasks: TaskCardProps[];
  isLoading?: boolean;
  onTaskChange?: (task: TaskCardProps, start: Date, end: Date) => void;
  onTaskClick?: (taskId: Id<"tasks">) => void;
}

type TimelineZoomLevel = "day" | "week" | "month";

export const TaskTimeline = ({
  projectId,
  tasks,
  isLoading,
  onTaskChange,
  onTaskClick,
}: TaskTimelineProps) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const { can } = useProjectPermission(projectId);
  const [zoomLevel, setZoomLevel] = React.useState<TimelineZoomLevel>("day");

  /** Returns true when the viewport width is narrower than 768px (md breakpoint). */
  const getIsMobile = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  const statusGroupOrder: TaskStatus[] = [
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.BLOCKED,
    TASK_STATUS.IN_REVIEW,
    TASK_STATUS.DONE,
  ];
  const statusGroupLabels: Record<TaskStatus, string> = {
    [TASK_STATUS.TODO]: "To-Do",
    [TASK_STATUS.IN_PROGRESS]: "In Progress",
    [TASK_STATUS.BLOCKED]: "Blocked",
    [TASK_STATUS.IN_REVIEW]: "In Review",
    [TASK_STATUS.DONE]: "Done",
  };

  useEffect(() => {
    if (!ganttContainer.current || isLoading) return;
    if (tasks.length === 0) {
      gantt.clearAll();
      return;
    }

    try {
      gantt.clearAll();

      const isMobile = getIsMobile();

      // Configure basic settings
      gantt.config.date_format = "%Y-%m-%d %H:%i";
      gantt.config.fit_tasks = true;
      gantt.config.smart_rendering = true;
      const dateFormatter = gantt.date.date_to_str("%d %M %Y");
      gantt.config.static_background = true;
      gantt.config.autoscroll = true;
      gantt.config.min_column_width = 80;
      gantt.config.scale_height = 50;
      gantt.config.grid_width = isMobile ? 160 : 400;
      gantt.config.autofit = true; 
      
      if (isMobile) {
        gantt.config.columns = [
          { name: "text", label: "Task", tree: true, width: "*", min_width: 120 },
        ];
      } else {
        gantt.config.columns = [
          { name: "text", label: "Task Name", tree: true, width: "*", min_width: 150 },
          { 
            name: "start_date", 
            label: "Start Date", 
            align: "center", 
            width: 100,
            template: (task: GanttTask) => dateFormatter(task.start_date)
          },
          { name: "duration", label: "Days", align: "center", width: 60 },
        ];
      }

      gantt.config.row_height = isMobile ? 44 : 52;
      gantt.config.bar_height = isMobile ? 26 : 32;
      gantt.config.readonly = !can(PERMISSIONS.TIMELINE_MANAGE);

      if (zoomLevel === "day") {
        gantt.config.min_column_width = isMobile ? 50 : 80;
        gantt.config.scales = [
          { unit: "month", step: 1, format: "%F %Y" },
          { unit: "day", step: 1, format: isMobile ? "%d" : "%d %M" },
        ];
      } else if (zoomLevel === "week") {
        gantt.config.min_column_width = isMobile ? 60 : 90;
        gantt.config.scales = [
          { unit: "month", step: 1, format: "%F %Y" },
          { unit: "week", step: 1, format: (date) => `W${gantt.date.date_to_str("%W")(date)}` },
        ];
      } else {
        gantt.config.min_column_width = isMobile ? 80 : 120;
        gantt.config.scales = [
          { unit: "year", step: 1, format: "%Y" },
          { unit: "month", step: 1, format: isMobile ? "%M" : "%M" },
        ];
      }
      
      gantt.config.scroll_size = 6;
      gantt.config.autoscroll = true;
      gantt.config.scale_height = 50;
      
      gantt.templates.task_class = (start, end, task) => {
        if ((task as GanttTask).isGroup) return "gantt-group-row";
        switch (task.status) {
          case TASK_STATUS.DONE: return "gantt-status-done";
          case TASK_STATUS.IN_PROGRESS: return "gantt-status-progress";
          case TASK_STATUS.IN_REVIEW: return "gantt-status-review";
          case TASK_STATUS.BLOCKED: return "gantt-status-blocked";
          default: return "gantt-status-todo";
        }
      };
      gantt.templates.grid_row_class = (start, end, task) =>
        (task as GanttTask).isGroup ? "gantt-group-grid-row" : "";
      gantt.templates.task_row_class = (start, end, task) =>
        (task as GanttTask).isGroup ? "gantt-group-task-row" : "";

      const formattedData = {
        data: (() => {
          const groupedTasks: GanttTask[] = [];

          statusGroupOrder.forEach((status) => {
            const tasksByStatus = tasks.filter((task) => task.status === status);
            if (tasksByStatus.length === 0) return;

            const groupId = `group-${status}`;
            const groupStart = Math.min(
              ...tasksByStatus.map((task) => task.startDate ?? task.createdAt)
            );
            const groupEnd = Math.max(
              ...tasksByStatus.map((task) => {
                const start = task.startDate ?? task.createdAt;
                return task.dueDate ?? start + 86400000;
              })
            );

            groupedTasks.push({
              id: groupId,
              text: `${statusGroupLabels[status]} (${tasksByStatus.length})`,
              start_date: new Date(groupStart),
              end_date: new Date(groupEnd),
              progress: 0,
              status,
              open: true,
              readonly: true,
              isGroup: true,
            });

            tasksByStatus.forEach((task) => {
              const start = task.startDate
                ? new Date(task.startDate)
                : new Date(task.createdAt);
              const end = task.dueDate
                ? new Date(task.dueDate)
                : new Date(start.getTime() + 86400000);

              groupedTasks.push({
                id: task._id,
                text: task.title,
                start_date: start,
                end_date: end,
                progress: task.status === TASK_STATUS.DONE ? 1 : 0,
                status: task.status,
                open: true,
                parent: groupId,
              });
            });
          });

          return groupedTasks;
        })(),
        links: [],
      };

      const dates = formattedData.data.map(d => d.start_date.getTime());
      const endDates = formattedData.data.map(d => d.end_date.getTime());
      
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...endDates));
        
        // Add some padding to the range
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 14);
        
        gantt.config.start_date = minDate;
        gantt.config.end_date = maxDate;
      }

      gantt.init(ganttContainer.current);
      gantt.parse(formattedData);
      gantt.render();

      // Ensure the chart fills the container after init
      gantt.setSizes();

      // Set up ResizeObserver to handle container resizing
      if (ganttContainer.current) {
        resizeObserver.current = new ResizeObserver(() => {
          gantt.setSizes();
        });
        resizeObserver.current.observe(ganttContainer.current);
      }
    } catch (err) {
      console.error("Gantt initialization failed:", err);
    }

    const onAfterTaskUpdate = gantt.attachEvent("onAfterTaskUpdate", (id, item) => {
      if ((item as GanttTask).isGroup) return true;
      const originalTask = tasks.find((t) => t._id === id);
      if (originalTask && onTaskChange && item.start_date && item.end_date) {
        onTaskChange(originalTask, item.start_date, item.end_date);
      }
      return true;
    }, {});

    const onTaskClickEvent = gantt.attachEvent("onTaskClick", (id) => {
      const clickedTask = gantt.getTask(id) as GanttTask;
      if (clickedTask.isGroup) return true;
      if (onTaskClick) onTaskClick(id as Id<"tasks">);
      return true;
    }, {});

    return () => {
      gantt.detachEvent(onAfterTaskUpdate);
      gantt.detachEvent(onTaskClickEvent);
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, isLoading, onTaskChange, onTaskClick, zoomLevel]);

  const jumpToDate = (date: Date) => {
    if (!ganttContainer.current) return;
    gantt.showDate(date);
  };

  const navigateTimeline = (direction: "prev" | "next") => {
    const step = direction === "prev" ? -1 : 1;
    const current = gantt.getState().min_date ?? new Date();
    const target = new Date(current);

    if (zoomLevel === "day") {
      target.setDate(target.getDate() + (step * 7));
    } else if (zoomLevel === "week") {
      target.setDate(target.getDate() + (step * 14));
    } else {
      target.setMonth(target.getMonth() + step);
    }

    jumpToDate(target);
  };

  const focusTaskRange = () => {
    if (!tasks.length) return;
    const minStart = Math.min(...tasks.map((task) => task.startDate ?? task.createdAt));
    jumpToDate(new Date(minStart));
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-120 md:h-150 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">

        <div className="flex items-center rounded-lg border border-border/70 p-1">
          <Button
            type="button"
            size="sm"
            variant={zoomLevel === "day" ? "default" : "ghost"}
            className="h-8 px-2 md:px-3"
            onClick={() => setZoomLevel("day")}
          >
            <span className="hidden sm:inline">Day</span>
            <span className="sm:hidden text-[11px] font-bold">D</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={zoomLevel === "week" ? "default" : "ghost"}
            className="h-8 px-2 md:px-3"
            onClick={() => setZoomLevel("week")}
          >
            <span className="hidden sm:inline">Week</span>
            <span className="sm:hidden text-[11px] font-bold">W</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={zoomLevel === "month" ? "default" : "ghost"}
            className="h-8 px-2 md:px-3"
            onClick={() => setZoomLevel("month")}
          >
            <span className="hidden sm:inline">Month</span>
            <span className="sm:hidden text-[11px] font-bold">M</span>
          </Button>
        </div>

        <div className="ml-auto flex items-center rounded-lg border border-border/70 p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => navigateTimeline("prev")}
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => jumpToDate(new Date())}
            title="Today"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline ml-1">Today</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => navigateTimeline("next")}
            title="Next"
          >
            <ChevronRightIcon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline ml-1">Next</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={focusTaskRange}
            title="Fit Tasks"
          >
            <Target className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline ml-1">Fit</span>
          </Button>
        </div>
      </div>

      {tasks.length > 0 && (
        <Typography variant="smallText" className="md:hidden text-[10px] text-muted-foreground/60 flex items-center gap-1 px-0.5">
          <ZoomIn className="h-3 w-3 shrink-0" />
          Scroll horizontally to see the full timeline
        </Typography>
      )}

      <div className="gantt-wrapper w-full bg-card border rounded-2xl overflow-hidden shadow-sm h-105 sm:h-130 md:h-150">
        {tasks.length === 0 ? (
          <div className={cn("h-full flex flex-col items-center justify-center gap-3 px-6", patterns.emptyBox)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 border border-border/50">
              <CalendarClock className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <Typography className="text-sm font-semibold tracking-tight text-foreground/80">
              Timeline is empty
            </Typography>
            <Typography className="text-xs text-muted-foreground/60 text-center max-w-md">
              No tasks with schedule yet. Add start and due dates to tasks, then the timeline will appear here.
            </Typography>
          </div>
        ) : (
          <div 
            ref={ganttContainer} 
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
};
