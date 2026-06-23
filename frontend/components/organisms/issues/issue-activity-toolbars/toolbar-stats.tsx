"use client";

import React from "react";
import { Typography } from "@/components/atoms";

interface ToolbarStatsProps {
  filteredCount: number;
  totalCount: number;
}

export const ToolbarStats = ({ filteredCount, totalCount }: ToolbarStatsProps) => (
  <div className="flex items-center gap-2 pt-2 border-t border-border/10">
    <Typography className="text-[11px] font-bold text-muted-foreground/60">
      Showing <span className="text-foreground">{filteredCount}</span> activities
      <span className="mx-1.5 opacity-40">·</span>
      filtered from <span className="text-foreground/80">{totalCount}</span> total
    </Typography>
  </div>
);
