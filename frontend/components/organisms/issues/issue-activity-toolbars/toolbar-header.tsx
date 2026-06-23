"use client";

import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/atoms";
import { SearchInput } from "@/components/organisms";

interface ToolbarHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeFiltersCount: number;
}

export const ToolbarHeader = ({
  search,
  onSearchChange,
  activeFiltersCount
}: ToolbarHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <SearchInput value={search} onChange={onSearchChange} />

      <div className="flex items-center gap-2">
        <Button variant="outline" className="rounded-xl border-border/40 gap-2 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 transition-colors">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold">{activeFiltersCount}</span>
        </Button>
      </div>
    </div>
  );
};
