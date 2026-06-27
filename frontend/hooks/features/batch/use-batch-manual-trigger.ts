"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import type { TriggerBatchResponse } from "@/types/features";

interface UseBatchManualTriggerProps {
  isTriggering: boolean;
  triggerBatch: (payload?: { date?: string }) => Promise<TriggerBatchResponse>;
  refetch: () => void;
}

export function useBatchManualTrigger({
  isTriggering,
  triggerBatch,
  refetch,
}: UseBatchManualTriggerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(subDays(new Date(), 1), "yyyy-MM-dd") // Default: yesterday
  );
  const [triggerProgress, setTriggerProgress] = useState<number>(0);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleTriggerBatch = async () => {
    if (isTriggering) return;
    setTriggerProgress(5);
    setActiveJobId(null);

    // Progress bar simulation interval
    const interval = setInterval(() => {
      setTriggerProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    try {
      const res = await triggerBatch({ date: selectedDate });
      clearInterval(interval);
      setTriggerProgress(100);
      if (res && res.jobId) {
        setActiveJobId(res.jobId);
      }
      setTimeout(() => {
        setTriggerProgress(0);
        refetch();
      }, 1500);
    } catch (err) {
      clearInterval(interval);
      setTriggerProgress(0);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    triggerProgress,
    activeJobId,
    handleTriggerBatch,
  };
}
