"use client";

import React from "react";
import { X } from "lucide-react";
import { cn, ISSUE_ACTIVITY_ACTION_FILTERS } from "@/lib";
import { Badge } from "@/components/atoms";

interface ActionFiltersProps {
  selectedActions: string[];
  onToggle: (id: string) => void;
}

const ACTION_LABELS: Record<string, string> = {
  created: "Reported",
  updated: "Status Change",
  comment_added: "Comment",
};

export const ActionFilters = ({ selectedActions, onToggle }: ActionFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {ISSUE_ACTIVITY_ACTION_FILTERS.map((filter) => {
      const isActive = selectedActions.includes(filter.id);
      return (
        <Badge
          key={filter.id}
          onClick={() => onToggle(filter.id)}
          className={cn(
            "cursor-pointer px-4 py-1.5 rounded-lg text-[11px] font-semibold tracking-normal border transition-all",
            isActive 
              ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20" 
              : "bg-muted/30 text-muted-foreground/60 border-transparent hover:bg-muted/50"
          )}
        >
          {ACTION_LABELS[filter.id] ?? filter.label}
          {isActive && <X className="ml-1.5 h-3 w-3" />}
        </Badge>
      );
    })}
  </div>
);
