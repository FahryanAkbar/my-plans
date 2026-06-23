"use client";

import * as React from "react";
import { Table } from "@/components/atoms";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export interface LatencyComparisonData {
  timestamp: number;
  latencyMs: number;
  googleTtfb?: number;
}

export interface ComparisonTableProps {
  data?: LatencyComparisonData[];
  isLoading?: boolean;
  className?: string;
}

export function ComparisonTable({
  data = [],
  isLoading = false,
  className,
}: ComparisonTableProps) {
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => b.timestamp - a.timestamp);
  }, [data]);

  const columns = React.useMemo<ColumnDef<LatencyComparisonData, unknown>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ getValue }) => {
          const timestamp = getValue<number>();
          return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        },
        meta: {
          className: "font-medium text-slate-500 dark:text-zinc-400",
        },
      },
      {
        accessorKey: "latencyMs",
        header: "Real Data (Local)",
        cell: ({ getValue }) => {
          const val = getValue<number>();
          return `${Math.round(val)}ms`;
        },
        meta: {
          headerClassName: "text-right justify-end",
          className:
            "text-right font-semibold text-slate-800 dark:text-zinc-200",
        },
      },
      {
        accessorKey: "googleTtfb",
        header: "Predicted (Google)",
        cell: ({ getValue }) => {
          const val = getValue<number | undefined>();
          return val ? `${Math.round(val)}ms` : "-";
        },
        meta: {
          headerClassName: "text-right justify-end",
          className:
            "text-right font-semibold text-slate-800 dark:text-zinc-200",
        },
      },
      {
        id: "deviation",
        header: "Deviation",
        cell: ({ row }) => {
          const latencyMs = row.original.latencyMs;
          const googleTtfb = row.original.googleTtfb;
          const dev = googleTtfb ? Math.round(googleTtfb - latencyMs) : null;

          if (dev === null) {
            return <span className="text-slate-400">-</span>;
          }

          const isPositive = dev > 0;
          return (
            <span
              className={cn(
                "font-bold",
                isPositive ? "text-primary" : "text-success",
              )}
            >
              {isPositive ? `+${dev}ms` : `${dev}ms`}
            </span>
          );
        },
        meta: {
          headerClassName: "text-right justify-end",
          className: "text-right",
        },
      },
    ],
    [],
  );

  return (
    <div className={cn("w-full mt-2", className)}>
      <Table
        data={sortedData}
        columns={columns}
        isLoading={isLoading}
        enablePagination={true}
        pageSize={5}
        emptyMessage="No comparison data available."
      />
    </div>
  );
}
