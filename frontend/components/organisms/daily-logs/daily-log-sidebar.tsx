"use client";

import React, { useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  History, 
  ChevronRight 
} from "lucide-react";
import { 
  Calendar, 
  Typography,
  Button
} from "@/components/atoms";
import { 
  cn,
  getQuickHistoryItems, 
  isSameLogDate } from "@/lib";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface DailyLogSidebarProps {
  projectId: Id<"projects">;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}


export const DailyLogSidebar = ({
  projectId,
  selectedDate,
  onDateChange,
  className
}: DailyLogSidebarProps) => {
  const historyItems = useMemo(() => getQuickHistoryItems(3), []);
  const projectLogs = useQuery(api.dailyLog.getByProject, { projectId });

  const loggedDates = useMemo(() => {
    if (!projectLogs) return [];
    return projectLogs.map(log => new Date(log.date));
  }, [projectLogs]);

  return (
    <aside className={cn("flex flex-col h-full bg-muted/5", className)}>
      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-x-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <Typography className="text-xs font-bold uppercase tracking-wider">
              Log Navigation
            </Typography>
          </div>
          
          <div className="p-2 bg-background border rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in duration-500">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              className="rounded-xl border-none w-full"
              modifiers={{
                hasLog: loggedDates
              }}
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-muted text-foreground",
              }}
              modifiersClassNames={{
                hasLog: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
              }}
            />


          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-x-2 text-muted-foreground px-1">
            <History className="h-4 w-4" />
            <Typography className="text-xs font-bold uppercase tracking-wider">
              Quick History
            </Typography>
          </div>

          <div className="space-y-2">
            {historyItems.map((item) => {
              const isActive = isSameLogDate(item.date, selectedDate);

              return (
                <Button
                  key={item.dateKey}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-between group h-10 px-3 rounded-xl transition-all",
                    isActive ? "bg-primary/5 text-primary border border-primary/10 shadow-sm" : "hover:bg-muted/50"
                  )}
                  onClick={() => onDateChange(item.date)}
                >
                  <div className="flex flex-col items-start gap-y-0.5">
                    <span className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold">
                      {item.subLabel}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    isActive ? "text-primary translate-x-0" : "text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                  )} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-2">
          <Typography className="text-[10px] font-bold text-primary uppercase tracking-wider">
            Did you know?
          </Typography>
          <Typography className="text-xs text-muted-foreground leading-relaxed">
            Consistency in daily reporting improves team velocity by up to 25%.
          </Typography>
        </div>
      </div>
    </aside>
  );
};
