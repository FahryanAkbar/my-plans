"use client";

import React from "react";
import { 
  User, 
  Calendar, 
  Flag, 
  Clock, 
  PlayCircle,
  type LucideIcon 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { TaskWithDetails } from "@/types/features";
import { Typography } from "@/components/atoms";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

const InfoRow = ({ icon: Icon, label, children }: InfoRowProps) => (
  <div className="grid grid-cols-3 items-center py-4 group/row">
    <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors group-hover/row:text-foreground">
      <Icon className="h-4 w-4" />
      <Typography className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</Typography>
    </div>
    <div className="col-span-2 flex justify-end sm:justify-start">
      {children}
    </div>
  </div>
);

interface TaskDetailInfoProps {
  task: TaskWithDetails;
}

export const TaskDetailInfo = ({ task }: TaskDetailInfoProps) => {
  return (
    <div className="bg-muted/10 rounded-[2.5rem] p-6 divide-y divide-border/20 border border-border/40 transition-all duration-500 hover:bg-muted/15 hover:border-border/60">
      <InfoRow icon={User} label="Assignee">
        <div className="flex items-center gap-3">
          {task.assigneeDetails?.[0] ? (
            <>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 border-2 border-background ring-2 ring-primary/20 shadow-xl">
                {task.assigneeDetails[0].imageUrl ? (
                  <img src={task.assigneeDetails[0].imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                    {task.assigneeDetails[0].fullName[0]}
                  </div>
                )}
              </div>
              <Typography className="text-sm font-bold tracking-tight">{task.assigneeDetails[0].fullName}</Typography>
            </>
          ) : (
            <Typography className="text-sm text-muted-foreground/40 italic font-medium">No assignee</Typography>
          )}
        </div>
      </InfoRow>

      <InfoRow icon={Calendar} label="Timeline">
        <div className="text-sm font-bold tracking-tight">
          {task.startDate ? (
            <Typography className="flex items-center gap-2">
              {format(task.startDate, "dd MMM yyyy")}
              {task.dueDate && (
                <>
                  <span className="text-muted-foreground/30 font-light">•</span>
                  {format(task.dueDate, "dd MMM yyyy")}
                </>
              )}
            </Typography>
          ) : (
            <Typography className="text-sm text-muted-foreground/40 italic font-medium">No timeline set</Typography>
          )}
        </div>
      </InfoRow>

      <InfoRow icon={Flag} label="Priority">
        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border/50 shadow-inner">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            task.priority === TASK_PRIORITY.HIGH ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : 
            task.priority === TASK_PRIORITY.MEDIUM ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]" : 
            "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          )} />
          <Typography className="text-[10px] font-black uppercase tracking-widest">{task.priority}</Typography>
        </div>
      </InfoRow>

      <InfoRow icon={Clock} label="Investment">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <Typography className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-tighter">Actual</Typography>
            <Typography className="text-sm font-black text-blue-600 flex items-center gap-1.5">
              {task.status === TASK_STATUS.IN_PROGRESS && <PlayCircle className="h-3.5 w-3.5 animate-pulse fill-blue-600/10" />}
              {task.actualHours || 0} <span className="text-[10px] opacity-60">HRS</span>
            </Typography>
          </div>
          <div className="h-8 w-px bg-border/20" />
          <div className="flex flex-col gap-0.5">
            <Typography className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-tighter">Estimated</Typography>
            <Typography className="text-sm font-black">{task.estimatedHours || 0} <span className="text-[10px] opacity-60">HRS</span></Typography>
          </div>
        </div>
      </InfoRow>
    </div>
  );
};
