"use client";

import React from "react";
import { Calendar, Filter } from "lucide-react";
import { 
  Button, 
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandList,
  CommandGroup,
  CommandItem
} from "@/components/atoms";
import { ISSUE_ACTIVITY_PERIOD_FILTERS } from "@/lib/constants/issue/issue";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const PeriodSelector = ({
  selectedPeriod,
  onPeriodChange
}: PeriodSelectorProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg border-border/40 bg-muted/30 text-muted-foreground/60 h-8 px-4 hover:bg-muted/50 text-[11px] font-bold gap-2">
          <Calendar className="h-3 w-3" />
          {ISSUE_ACTIVITY_PERIOD_FILTERS.find(p => p.id === selectedPeriod)?.label || "Periode"}
          <Filter className="h-2.5 w-2.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-48 rounded-xl overflow-hidden shadow-2xl border-border/50" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {ISSUE_ACTIVITY_PERIOD_FILTERS.map((period) => (
                <CommandItem 
                  key={period.id}
                  onSelect={() => onPeriodChange(period.id)}
                  className="text-xs gap-2 py-2"
                >
                  {period.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
