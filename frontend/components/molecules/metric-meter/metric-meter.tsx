"use client";

import React from "react";
import { Info, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { 
  Card, 
  Typography, 
  GaugeChart, 
  GaugeSegment,
  GaugeValueSegment,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/atoms";
import { cn } from "@/lib/utils";
export interface MetricStat {
  label: string;
  value: string | number;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
}

export interface MetricMeterProps {
  title: string;
  value?: number;
  valueSegments?: GaugeValueSegment[];
  min?: number;
  max?: number;
  label?: string;
  subLabel?: string;
  info?: string;
  stats?: MetricStat[];
  segments?: GaugeSegment[];
  gaugeHeight?: number | string;
  className?: string;
  noCard?: boolean;
}

const DEFAULT_SEGMENTS: GaugeSegment[] = [
  { name: "Track", value: 100, color: "color-mix(in srgb, var(--muted-foreground) 8%, transparent)" },
];

export const MetricMeter = ({
  title,
  value,
  valueSegments,
  min = 0,
  max = 100,
  label,
  subLabel,
  info,
  stats = [],
  segments = DEFAULT_SEGMENTS,
  gaugeHeight = 180,
  className,
  noCard = false
}: MetricMeterProps) => {
  const Container = noCard ? "div" : Card;

  return (
    <Container className={cn(
      !noCard && "p-6 flex flex-col gap-y-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl rounded-[2rem] overflow-hidden", 
      noCard && "flex flex-col gap-y-6",
      className
    )}>
      <div className="flex items-center justify-between px-2">
        <Typography className="text-xl font-bold tracking-tight">
          {title}
        </Typography>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help text-muted-foreground/60 hover:text-foreground transition-all duration-200">
                  <Info className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-55 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest leading-relaxed p-3 rounded-xl">
                {info}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="px-2">
        <GaugeChart 
          data={segments}
          value={value}
          valueSegments={valueSegments}
          min={min}
          max={max}
          label={label}
          subLabel={subLabel}
          height={gaugeHeight}
        />
      </div>
      
      {stats.length > 0 && (
        <div className={cn(
          "grid gap-px bg-border/20 rounded-2xl overflow-hidden border border-border/20 shadow-inner mt-6",
          stats.length === 6 ? "grid-cols-6" : 
          stats.length === 5 ? "grid-cols-5" : "grid-cols-3"
        )}>
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-card/40 p-4 flex flex-col gap-y-1.5 group transition-colors hover:bg-card/60"
            >
               <div className="flex items-center gap-x-1.5">
                  <Typography className={cn(
                    "font-black leading-none tracking-tighter",
                    (stats.length === 5 || stats.length === 6) ? "text-lg" : "text-2xl"
                  )}>
                    {stat.value}
                  </Typography>
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {stat.trendDirection === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
                    {stat.trendDirection === "down" && <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />}
                    {stat.trendDirection === "neutral" && <Minus className="h-3.5 w-3.5 text-slate-400" />}
                  </div>
               </div>
               
               <div className="flex flex-col">
                 <Typography className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 leading-none">
                   {stat.label}
                 </Typography>
                 {stat.trend !== undefined && (
                   <Typography className={cn(
                     "text-[8px] font-bold mt-1.5 leading-none",
                     stat.trendDirection === "up" ? "text-emerald-500" : 
                     stat.trendDirection === "down" ? "text-rose-500" : "text-slate-400"
                   )}>
                     {stat.trend}%
                   </Typography>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};
