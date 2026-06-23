"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardTitle, CardDescription } from "@/components/atoms";

export interface MonitoringEmptyStateProps {
  className?: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function MonitoringEmptyState({
  className,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: MonitoringEmptyStateProps) {
  return (
    <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col justify-between", className)}>
      <div>
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {description}
        </CardDescription>
      </div>
      <div className="my-10 flex flex-col items-center justify-center text-center p-6 bg-transparent">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-foreground">{emptyTitle}</span>
        <span className="text-xs text-muted-foreground max-w-72 mt-1 leading-normal">
          {emptyDescription}
        </span>
      </div>
    </Card>
  );
}