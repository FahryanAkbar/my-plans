"use client";

import React from "react";
import { cn } from "@/lib";
import { 
  MemberSelector, 
  PeriodSelector, 
  ActionFilters, 
  ToolbarStats,
  ToolbarHeader
} from "./issue-activity-toolbars";
import { ProjectMember } from "@/types/features";

interface IssueActivityToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedActions: string[];
  onActionsChange: (actions: string[]) => void;
  selectedMemberId: string;
  onMemberChange: (id: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  members: ProjectMember[];
  totalCount: number;
  filteredCount: number;
  className?: string;
}

export const IssueActivityToolbar = ({
  search,
  onSearchChange,
  selectedActions,
  onActionsChange,
  selectedMemberId,
  onMemberChange,
  selectedPeriod,
  onPeriodChange,
  members,
  totalCount,
  filteredCount,
  className
}: IssueActivityToolbarProps) => {
  const toggleAction = (id: string) => {
    onActionsChange(
      selectedActions.includes(id)
        ? selectedActions.filter(a => a !== id)
        : [...selectedActions, id]
    );
  };

  const activeFiltersCount = 
    selectedActions.length + 
    (selectedMemberId !== "all" ? 1 : 0) + 
    (selectedPeriod !== "all" ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      <ToolbarHeader 
        search={search}
        onSearchChange={onSearchChange}
        activeFiltersCount={activeFiltersCount}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex flex-wrap items-center gap-2">
          <ActionFilters selectedActions={selectedActions} onToggle={toggleAction} />
        </div>
        
        <div className="hidden sm:block h-4 w-px bg-border/40 mx-1" />

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <div className="w-full [&>button]:w-full [&>button]:justify-between sm:[&>button]:w-auto sm:[&>button]:justify-center">
            <MemberSelector 
              selectedMemberId={selectedMemberId}
              onMemberChange={onMemberChange}
              members={members}
            />
          </div>

          <div className="w-full [&>button]:w-full [&>button]:justify-between sm:[&>button]:w-auto sm:[&>button]:justify-center">
            <PeriodSelector 
              selectedPeriod={selectedPeriod}
              onPeriodChange={onPeriodChange}
            />
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <ToolbarStats filteredCount={filteredCount} totalCount={totalCount} />
    </div>
  );
};
