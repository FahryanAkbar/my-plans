"use client";

import React from "react";
import { Play } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/atoms";
import { format, subDays } from "date-fns";
import { useBatchManualTrigger } from "@/hooks";
import { TriggerBatchResponse } from "@/types/features";

interface BatchManualTriggerProps {
  isTriggering: boolean;
  triggerBatch: (payload?: { date?: string }) => Promise<TriggerBatchResponse>;
  refetch: () => void;
}

export function BatchManualTrigger({
  isTriggering,
  triggerBatch,
  refetch,
}: BatchManualTriggerProps) {
  const {
    selectedDate,
    setSelectedDate,
    triggerProgress,
    activeJobId,
    handleTriggerBatch,
  } = useBatchManualTrigger({
    isTriggering,
    triggerBatch,
    refetch,
  });

  return (
    <Card className="lg:col-span-1 border border-border/30 bg-card/45 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/15">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          Manual Pipeline Trigger
        </CardTitle>
        <CardDescription className="text-xs">
          Manually compile hourly InfluxDB latency data points into daily report
          summaries.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground/80 block">
            Target Batch Date:
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              max={format(subDays(new Date(), 1), "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-muted/40 dark:bg-slate-950/40 border border-border/25 rounded-xl px-3.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 font-mono"
            />
          </div>
        </div>

        {triggerProgress > 0 && (
          <div className="space-y-1.5 animate-in fade-in duration-300">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/75 uppercase tracking-wider">
              <span>Aggregating Pipeline Logs...</span>
              <span>{triggerProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(67,97,238,0.5)]"
                style={{ width: `${triggerProgress}%` }}
              />
            </div>
            {activeJobId && (
              <div className="text-[10px] font-mono text-emerald-400">
                Queue Job ID: {activeJobId}
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full gap-2 text-xs font-bold py-2 shadow-md"
          onClick={handleTriggerBatch}
          disabled={isTriggering || triggerProgress > 0}
        >
          <Play className="h-3.5 w-3.5" />
          {isTriggering ? "Spawning Redis Job..." : "Run Batch Pipeline"}
        </Button>
      </CardContent>
    </Card>
  );
}
