"use client";

import React, { useState } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { Card, Typography, Badge } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { ProjectHealthData } from "@/hooks";

interface ResumeCardsProps {
  healthData: ProjectHealthData;
}

export const ResumeCards = ({ healthData }: ResumeCardsProps) => {
  const { totalTasks, doneCount, inProgressCount, inReviewCount, blockedCount, todoCount, overdueCount } = healthData;
  
  const inProgressTotal = inProgressCount + inReviewCount;
  const completionPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  
  const actualOverdue = overdueCount;
  const actualBlocked = blockedCount; 
  const onTrackCount = Math.max(0, totalTasks - actualOverdue - actualBlocked);
  
  const onTrackPercentage = totalTasks > 0 ? Math.round((onTrackCount / totalTasks) * 100) : 0;
  const atRiskPercentage = totalTasks > 0 ? Math.round((actualBlocked / totalTasks) * 100) : 0;
  const overduePercentage = totalTasks > 0 ? Math.round((actualOverdue / totalTasks) * 100) : 0;

  const projectStatusSegments = [
    { color: "#10b981", label: "Done", count: doneCount, percentage: totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0 },
    { color: "#3b82f6", label: "Active", count: inProgressTotal, percentage: totalTasks > 0 ? Math.round((inProgressTotal / totalTasks) * 100) : 0 },
    { color: "#f59e0b", label: "Blocked", count: blockedCount, percentage: totalTasks > 0 ? Math.round((blockedCount / totalTasks) * 100) : 0 },
    { color: "#64748b", label: "Empty", count: todoCount, percentage: totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0 },
  ].filter(s => s.count > 0);

  return (
    <>
      <Card className="p-4 flex flex-col bg-card border border-border/50 shadow-none rounded-2xl w-full h-full">
        <div className="flex items-center justify-between mb-4">
          <Typography className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            Project Progress
          </Typography>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
            Stable
          </Badge>
        </div>

        {actualOverdue > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-start gap-2 mb-4 transition-all duration-300 cursor-default">
            <AlertCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <Typography className="text-xs font-semibold text-red-500">
                Overdue
              </Typography>
              <Typography className="text-[10px] text-red-500/80">
                {actualOverdue} tasks are past their deadline
              </Typography>
            </div>
          </div>
        )}

        <div className={cn("flex items-end justify-between", actualOverdue === 0 && "mb-4")}>
          <div className="flex flex-col">
            <Typography className="text-2xl font-bold tracking-tight">
              {completionPercentage}%
            </Typography>
            <Typography className="text-[11px] font-medium text-muted-foreground/60 mt-0.5">
              {doneCount} of {totalTasks} tasks completed
            </Typography>
          </div>
        </div>

        <SegmentedBar
          segments={[
            { color: "#10b981", value: doneCount, label: "Completed" },
            { color: "#3b82f6", value: inProgressTotal, label: "In progress" },
            { color: "#f59e0b", value: blockedCount, label: "At risk" },
            { color: "#64748b", value: todoCount, label: "Not started" },
          ]}
          total={totalTasks}
        />

        <div className="mt-2 rounded-xl border border-border/40 bg-muted/10 overflow-hidden">
          <div className="flex divide-x divide-border/40">
            {projectStatusSegments.map((seg, i) => (
              <LegendItem 
                key={i}
                color={seg.color} 
                label={seg.label} 
                count={seg.count} 
                percentage={seg.percentage} 
              />
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4 flex flex-col bg-card border border-border/50 shadow-none rounded-2xl w-full h-full">
        <Typography className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">
          On-Track Index
        </Typography>

        <div className="flex flex-col mb-6">
          <Typography className={cn(
            "text-2xl font-bold tracking-tight",
            onTrackPercentage < 50 ? "text-red-500" : onTrackPercentage < 80 ? "text-amber-500" : "text-emerald-500"
          )}>
            {onTrackPercentage}%
          </Typography>
          <Typography className="text-[11px] font-medium text-muted-foreground/60 mt-0.5">
            Only {onTrackCount} of {totalTasks} tasks on track
          </Typography>
        </div>

        <div className="flex flex-col gap-4">
          <ProgressBarRow 
            label="On track" 
            count={onTrackCount} 
            percentage={onTrackPercentage} 
            color="bg-emerald-500" 
            badgeColor="bg-emerald-500/10 text-emerald-500"
          />
          {actualBlocked > 0 && (
            <ProgressBarRow 
              label="At risk" 
              count={actualBlocked} 
              percentage={atRiskPercentage} 
              color="bg-amber-500" 
              badgeColor="bg-amber-500/10 text-amber-500"
            />
          )}
          {actualOverdue > 0 && (
            <ProgressBarRow 
              label="Overdue" 
              count={actualOverdue} 
              percentage={overduePercentage} 
              color="bg-red-500" 
              badgeColor="bg-red-500/10 text-red-500"
            />
          )}
        </div>

        <div className="bg-muted/30 rounded-lg p-2.5 mt-auto flex items-start gap-2 border border-border/20">
          <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0 mt-0.5" />
          <Typography className="text-[10px] font-medium text-muted-foreground/80 leading-relaxed">
            {actualOverdue > 0 
              ? `${actualOverdue} tasks remain incomplete after deadline.` 
              : "All tasks are currently meeting expectations."}
          </Typography>
        </div>
      </Card>
    </>
  );
};

function LegendItem({ color, label, count, percentage }: { color: string, label: string, count: number, percentage: number }) {
  return (
    <div className="flex-1 flex flex-col gap-1 p-3 transition-all hover:bg-muted/30 cursor-default relative overflow-hidden group">
      <div className="flex items-center gap-1.5">
        <div 
          className="h-1.5 w-1.5 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <Typography className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
          {label}
        </Typography>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <Typography className="text-lg font-bold leading-none">
            {count}
          </Typography>
          <Typography className="text-[8px] font-semibold text-muted-foreground/60 uppercase tracking-tight">
            tasks
          </Typography>
        </div>
        <Typography className="text-[8px] font-bold opacity-20 mt-0.5">
          {percentage}%
        </Typography>
      </div>
    </div>
  );
}

function SegmentedBar({ segments, total }: { segments: { color: string, value: number, label: string }[], total: number }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-1 mt-1 mb-3 relative">
      <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-0.5 bg-muted/20">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full transition-all duration-300 cursor-pointer"
            style={{
              width: `${total > 0 ? (seg.value / total) * 100 : 0}%`,
              backgroundColor: seg.color,
              opacity: activeIndex === null ? 1 : activeIndex === i ? 1 : 0.25,
            }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          />
        ))}
      </div>
      {activeIndex !== null && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 border border-white/10 shadow-lg z-20 whitespace-nowrap pointer-events-none transition-all duration-200 scale-100 origin-bottom">
          <Typography className="text-[8px] font-bold text-white uppercase tracking-wider">
            {segments[activeIndex].label}: {segments[activeIndex].value} tasks
          </Typography>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-black/80" />
        </div>
      )}
    </div>
  );
}

function ProgressBarRow({ label, count, percentage, color, badgeColor }: { label: string, count: number, percentage: number, color: string, badgeColor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col gap-1.5 px-1 py-1 -mx-1 rounded-lg transition-all duration-200 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <Typography className={cn("text-[11px] font-semibold transition-colors duration-200", hovered && "text-foreground")}>
          {label}
        </Typography>
        <div className={cn(
          "px-1.5 py-0.5 rounded text-[8px] font-bold transition-all duration-200",
          badgeColor,
          hovered && "scale-105"
        )}>
          {count} tasks
        </div>
      </div>
      <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
