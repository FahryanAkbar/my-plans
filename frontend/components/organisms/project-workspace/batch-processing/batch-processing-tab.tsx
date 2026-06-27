"use client";

import React from "react";
import { RefreshCw, Layers } from "lucide-react";
import { Button, Typography } from "@/components/atoms";
import { useBatchProcessingTab } from "@/hooks";

// Sub-components
import { BatchManualTrigger } from "./batch-manual-trigger";
import { BatchPerformanceChart } from "./batch-performance-chart";
import { BatchUptimeGrid } from "./batch-uptime-grid";
import { BatchReportsTable } from "./batch-reports-table";
import { BatchSummaryCards } from "./batch-summary-cards";

interface BatchProcessingTabProps {
  projectId: string;
}

export function BatchProcessingTab({ projectId }: BatchProcessingTabProps) {
  const {
    summaries,
    configs,
    isLoading,
    isConfigsLoading,
    isTriggering,
    refetch,
    triggerBatch,
    kpis,
    chartData,
  } = useBatchProcessingTab(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <Typography
            variant="h6"
            className="text-lg font-bold flex items-center gap-2"
          >
            <Layers className="h-5 w-5 text-primary" />
            Batch Pipeline Processing
          </Typography>
          <Typography
            variant="caption"
            className="text-xs text-muted-foreground/70 block"
          >
            Analyze 30-day long-term aggregated logs and trigger manual Big Data
            jobs.
          </Typography>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          className="self-start md:self-auto gap-2"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Reload Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BatchManualTrigger
          isTriggering={isTriggering}
          triggerBatch={triggerBatch}
          refetch={refetch}
        />

        <BatchSummaryCards kpis={kpis} isLoading={isLoading} />
      </div>

      <BatchPerformanceChart chartData={chartData} isLoading={isLoading} />

      <BatchUptimeGrid
        configs={configs}
        summaries={summaries}
        isLoading={isLoading}
        isConfigsLoading={isConfigsLoading}
      />

      <BatchReportsTable
        summaries={summaries}
        configs={configs}
        isLoading={isLoading}
      />
    </div>
  );
}
