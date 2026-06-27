"use client";

import { useState, useMemo } from "react";
import type { DailySummaryResponse } from "@/types/features";

interface UseBatchReportsTableProps {
  summaries: DailySummaryResponse[];
}

export function useBatchReportsTable({ summaries }: UseBatchReportsTableProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "latency" | "uptime">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeConfigFilter, setActiveConfigFilter] = useState<string>("all");

  const toggleSort = (field: "date" | "latency" | "uptime") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Filter & Sort Summaries
  const filteredSummaries = useMemo(() => {
    return summaries
      .filter((s) => {
        const matchesSearch = s.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesConfig = activeConfigFilter === "all" || s.configId === activeConfigFilter;
        return matchesSearch && matchesConfig;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === "date") {
          comp = a.date.localeCompare(b.date);
        } else if (sortBy === "latency") {
          comp = a.avgLatencyMs - b.avgLatencyMs;
        } else if (sortBy === "uptime") {
          comp = a.uptimePercent - b.uptimePercent;
        }
        return sortOrder === "asc" ? comp : -comp;
      });
  }, [summaries, searchQuery, sortBy, sortOrder, activeConfigFilter]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    activeConfigFilter,
    setActiveConfigFilter,
    toggleSort,
    filteredSummaries,
  };
}
