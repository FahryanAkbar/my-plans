"use client";

import React, { useState, useMemo } from "react";
import { 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import { cn, generateCalendarDays, filterDataByDay } from "@/lib";
import { Button, Typography } from "@/components/atoms";

interface TaskCalendarProps {
  projectId: Id<"projects">;
  onAddLog: (date: Date) => void;
  onViewDailyLog: (date: number) => void;
}

export const TaskCalendar = ({
  projectId,
  onAddLog,
  onViewDailyLog
}: TaskCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dailyLogs = useQuery(api.dailyLog.getByProject, { projectId });
  const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm gap-y-4">
        <div className="flex items-center gap-x-4">
          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col gap-y-1">
            <Typography variant="h4" className="font-bold leading-none tracking-tight">
              {format(currentDate, "MMMM yyyy")}
            </Typography>
            <Typography variant="muted" className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              Daily Progress & Team Logs
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <Button variant="outline" size="sm" onClick={goToToday} className="shrink-0">
            Today
          </Button>
          <div className="flex items-center bg-muted/50 rounded-lg p-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="md:ml-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
            size="sm"
            onClick={() => onAddLog(new Date())}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Report Progress</span>
            <span className="sm:hidden ml-1">Report</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <div className="min-w-[600px] flex-1 flex flex-col">
            <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
              {weekdays.map((day) => (
                <div key={day} className="py-3 text-center">
                  <Typography variant="muted" className="text-xs font-semibold uppercase tracking-wider">
                    {day}
                  </Typography>
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const logs = filterDataByDay(dailyLogs, day);
            const isTodayDate = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div 
                key={idx}
                className={cn(
                  "relative min-h-30 p-2 border-r border-b border-border/40 transition-colors group hover:bg-muted/20",
                  !isCurrentMonth && "bg-muted/10 opacity-40",
                  idx % 7 === 6 && "border-r-0"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "inline-flex items-center justify-center h-7 w-7 text-sm font-medium rounded-full transition-colors",
                    isTodayDate ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  {isCurrentMonth && (
                    <button 
                      onClick={() => onAddLog(day)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded-md text-primary transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-20 scrollbar-hide">
                  {logs.map((log) => (
                    <button
                      key={log._id}
                      onClick={() => onViewDailyLog(log.date)}
                      className="w-full text-left px-2 py-1 rounded-md bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all flex items-center gap-x-2 group/item"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <Typography className="text-[10px] font-medium truncate flex-1">
                        {log.title || "Daily Progress"}
                      </Typography>
                    </button>
                  ))}
                </div>

                {logs.length > 0 && (
                  <div className="absolute bottom-2 right-2 flex gap-x-1">
                    <div className="flex items-center gap-x-0.5 text-[9px] text-muted-foreground bg-background/50 px-1 rounded-full border border-border/50">
                      <MessageSquare className="h-2 w-2" />
                      {logs.length}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-x-6 py-2">
        <div className="flex items-center gap-x-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <Typography variant="muted" className="text-[10px]">Team Progress Reported</Typography>
        </div>
        <div className="flex items-center gap-x-2">
          <div
            className="h-2 w-2 rounded-full bg-primary"
            style={{ boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)" }}
          />
          <Typography variant="muted" className="text-[10px]">Milestone Achieved</Typography>
        </div>
      </div>
    </div>
  );
};
