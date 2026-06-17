"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/atoms";
import { cn, stripHtml } from "@/lib";
import { tokens } from "@/lib/styles/tokens";

interface TaskToolbarSearchProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export const TaskToolbarSearch = ({
  searchTerm,
  onSearchChange,
}: TaskToolbarSearchProps) => {
  return (
    <div className="relative w-full sm:w-60 shrink-0">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", tokens.size.iconSm)} />
      <Input 
        placeholder="Search tasks..." 
        value={searchTerm}
        maxLength={50}
        onChange={(e) => onSearchChange?.(stripHtml(e.target.value))}
        className={cn(
          "pl-9 h-9 w-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-xs",
          tokens.radius.lg
        )}
      />
    </div>
  );
};
