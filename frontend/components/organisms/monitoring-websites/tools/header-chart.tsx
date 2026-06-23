"use client";

import * as React from "react";
import { CardTitle, CardDescription } from "@/components/atoms";

export interface HeaderChartProps {
  title: string;
  description?: string;
  showLegend?: boolean;
}

export function HeaderChart({ title, description, showLegend = false }: HeaderChartProps) {
  return (
    <div>
      <CardTitle className="text-base font-semibold text-foreground">
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {description}
        </CardDescription>
      )}
      {showLegend && (
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-muted-foreground">Predicted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs font-semibold text-muted-foreground">Real Data</span>
          </div>
        </div>
      )}
    </div>
  );
}