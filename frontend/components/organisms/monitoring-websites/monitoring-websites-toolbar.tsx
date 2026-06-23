import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import { Button, Typography } from "@/components/atoms";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/molecules";
import type { AnalyticsRange } from "@/types/features";

export interface MonitoringWebsitesToolbarProps {
  projectId: string;
  range: AnalyticsRange;
  onChangeRange: (range: AnalyticsRange) => void;
  className?: string;
}

const RANGES: { label: string; value: AnalyticsRange; description: string }[] = [
  { label: "1 Hour", value: "1h", description: "1 jam terakhir" },
  { label: "6 Hours", value: "6h", description: "6 jam terakhir" },
  { label: "12 Hours", value: "12h", description: "12 jam terakhir" },
  { label: "24 Hours", value: "24h", description: "24 jam terakhir" },
  { label: "7 Days", value: "7d", description: "7 hari terakhir" },
  { label: "30 Days", value: "30d", description: "30 hari terakhir" },
];

export function MonitoringWebsitesToolbar({
  projectId,
  range,
  onChangeRange,
  className,
}: MonitoringWebsitesToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <Link
        href={`/project/${projectId}?tab=monitoring`}
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Monitoring Configurations
      </Link>

      <div className="flex items-center gap-3">
        <Typography variant="caption" className="text-xs text-muted-foreground/60 hidden sm:inline">
          Range:
        </Typography>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl border-border/80 shadow-xs bg-card hover:bg-muted/50 cursor-pointer">
              <Calendar className="h-4 w-4 text-muted-foreground/75" />
              <span className="font-semibold text-xs">
                {RANGES.find((r) => r.value === range)?.label ?? "24 Hours"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border border-border/80 shadow-md">
            {RANGES.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => onChangeRange(item.value)}
                className={cn(
                  "cursor-pointer font-medium text-xs",
                  range === item.value && "bg-muted text-foreground font-semibold"
                )}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
