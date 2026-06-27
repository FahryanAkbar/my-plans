"use client";

import { useState, useMemo } from "react";
import { useBatch, useProjectConfigs } from "@/hooks";
import { format } from "date-fns";

export function useBatchProcessingTab(projectId: string) {
  const [days, setDays] = useState<number>(30);
  const { 
    summaries, 
    isLoading, 
    isTriggering, 
    refetch, 
    triggerBatch 
  } = useBatch(projectId, days);

  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId);

  // 1. Calculate Summary KPIs
  const kpis = useMemo(() => {
    if (summaries.length === 0) {
      return {
        avgUptime: 100,
        avgLatency: 0,
        totalIncidents: 0,
        totalChecks: 0
      };
    }
    const totalUptime = summaries.reduce((acc, curr) => acc + curr.uptimePercent, 0);
    const totalLatency = summaries.reduce((acc, curr) => acc + curr.avgLatencyMs, 0);
    const totalIncidents = summaries.reduce((acc, curr) => acc + curr.downtimeIncidents, 0);
    const totalChecks = summaries.reduce((acc, curr) => acc + curr.totalChecks, 0);

    return {
      avgUptime: totalUptime / summaries.length,
      avgLatency: totalLatency / summaries.length,
      totalIncidents,
      totalChecks
    };
  }, [summaries]);

  // 2. Map summaries by Date for the Chart (grouped daily)
  const chartData = useMemo(() => {
    const dailyMap: Record<string, { date: string; avgLatencyMs: number; count: number; uptimePercentSum: number; entries: number }> = {};
    
    summaries.forEach((s) => {
      if (!dailyMap[s.date]) {
        dailyMap[s.date] = {
          date: s.date,
          avgLatencyMs: 0,
          count: 0,
          uptimePercentSum: 0,
          entries: 0
        };
      }
      dailyMap[s.date].avgLatencyMs += s.avgLatencyMs;
      dailyMap[s.date].count += 1;
      dailyMap[s.date].uptimePercentSum += s.uptimePercent;
      dailyMap[s.date].entries += 1;
    });

    return Object.values(dailyMap)
      .map((d) => ({
        date: format(new Date(d.date), "dd MMM"),
        "Avg Latency (ms)": Math.round(d.avgLatencyMs / d.count),
        "Uptime (%)": parseFloat((d.uptimePercentSum / d.entries).toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [summaries]);

  return {
    summaries,
    configs,
    isLoading,
    isConfigsLoading,
    isTriggering,
    refetch,
    triggerBatch,
    kpis,
    chartData,
    days,
    setDays,
  };
}
