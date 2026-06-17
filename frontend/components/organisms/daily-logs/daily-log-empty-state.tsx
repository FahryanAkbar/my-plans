"use client";

import React from "react";
import { Sparkles, Plus, FileText, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { 
  Typography, 
  Button 
} from "@/components/atoms";
import { cn } from "@/lib";

interface DailyLogEmptyStateProps {
  date: Date;
  onStart: () => void;
  className?: string;
}

export const DailyLogEmptyState = ({
  date,
  onStart,
  className
}: DailyLogEmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-112.5 w-full max-w-lg mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-2 duration-1000",
      className
    )}>
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 w-20 h-20 bg-background border border-border/60 rounded-4xl shadow-xl flex items-center justify-center transition-transform duration-500 group">
          <Calendar className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
          <div className="absolute -bottom-1 -right-1 bg-foreground text-background p-1.5 rounded-xl shadow-lg ring-4 ring-background">
            <Plus className="h-3 w-3 stroke-3" />
          </div>
        </div>

        <div className="absolute -top-3 -left-6 animate-bounce duration-3500">
          <div className="bg-background border border-border/40 shadow-sm p-1.5 rounded-lg -rotate-6">
            <FileText className="h-3.5 w-3.5 text-blue-500/70" />
          </div>
        </div>
        
        <div className="absolute top-8 -right-8 animate-pulse duration-4000">
          <div className="bg-background border border-border/40 shadow-sm p-1.5 rounded-lg rotate-12">
            <Sparkles className="h-3.5 w-3.5 text-amber-500/70" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-2.5">
        <Typography className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.25em] opacity-60">
          Empty Daily Log
        </Typography>
        
        <div className="space-y-4">
          <Typography className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Fresh start?
          </Typography>
          
          <Typography className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-85 mx-auto">
            No records found for <span className="text-foreground font-semibold">{format(date, "EEEE, MMM do")}</span>. Use our team template to kickstart your reporting.
          </Typography>
        </div>
      </div>

      <div className="mt-10 w-full flex justify-center">
        <Button 
          onClick={onStart}
          variant="default"
          size="default"
          className="group inline-flex items-center"
        >
          Initialize Report
          <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      
    </div>
  );
};
