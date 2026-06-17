"use client";

import { format } from "date-fns";
import { 
  CalendarIcon, 
  Globe, 
  Smartphone, 
  Monitor, 
  Layers,
} from "lucide-react";
import { 
  Card, CardHeader, CardTitle, CardContent, 
  Button, Typography, Calendar, Popover, PopoverContent, PopoverTrigger 
} from "@/components/atoms";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS, PROJECT_PLATFORM } from "@/lib/constants/project";

interface TimelineSectionProps {
  startDate?: number;
  endDate?: number;
  status: string;
  platform: string;
  onStartDateChange: (date?: number) => void;
  onEndDateChange: (date?: number) => void;
  onStatusChange: (status: string) => void;
  onPlatformChange: (platform: string) => void;
}

export const TimelineSection = ({
  startDate,
  endDate,
  status,
  platform,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onPlatformChange,
}: TimelineSectionProps) => {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Timeline & Configuration
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Typography variant="smallText">Start Date</Typography>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-10 border-border/50">
                  <span className="font-medium text-xs">
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </span>
                  <CalendarIcon className="h-4 w-4 opacity-40" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => onStartDateChange(date?.getTime())}
                  className="w-full"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Typography variant="smallText">End Date</Typography>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-10 border-border/50">
                  <span className="font-medium text-xs">
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </span>
                  <CalendarIcon className="h-4 w-4 opacity-40" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => onEndDateChange(date?.getTime())}
                  disabled={(date) => startDate ? date < new Date(startDate) : false}
                  className="w-full"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Typography variant="smallText" className="text-muted-foreground/70 mb-1 block">Project Status</Typography>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              { id: PROJECT_STATUS.PLANNING, label: "Planning", color: "hover:text-slate-600 dark:hover:text-slate-400" },
              { id: PROJECT_STATUS.ONGOING, label: "In-Progress", color: "hover:text-amber-600 dark:hover:text-amber-400" },
              { id: PROJECT_STATUS.AT_RISK, label: "At Risk", color: "hover:text-purple-600 dark:hover:text-purple-400" },
              { id: PROJECT_STATUS.LATED, label: "Late", color: "hover:text-red-600 dark:hover:text-red-400" },
              { id: PROJECT_STATUS.COMPLETED, label: "Completed", color: "hover:text-green-600 dark:hover:text-green-400" },
            ].map((s) => (
              <Button
                key={s.id}
                type="button"
                variant={status === s.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-12 flex items-center justify-center transition-all duration-300 border-border/40 font-medium text-muted-foreground",
                  status === s.id 
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold shadow-sm text-primary-foreground" 
                    : s.color
                )}
                onClick={() => onStatusChange(s.id)}
              >
                <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Typography variant="smallText" className="text-muted-foreground/70 mb-1 block">Target Platform</Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: PROJECT_PLATFORM.WEB, label: "Web", icon: Globe },
              { id: PROJECT_PLATFORM.MOBILE, label: "Mobile", icon: Smartphone },
              { id: PROJECT_PLATFORM.DESKTOP, label: "Desktop", icon: Monitor },
              { id: PROJECT_PLATFORM.OTHER, label: "Other", icon: Layers },
            ].map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={platform === p.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-14 flex flex-col gap-1.5 items-center justify-center transition-all duration-300",
                  platform === p.id 
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md" 
                    : "border-border/40 hover:bg-muted/50"
                )}
                onClick={() => onPlatformChange(p.id)}
              >
                <p.icon className={cn("h-4 w-4", platform === p.id ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
