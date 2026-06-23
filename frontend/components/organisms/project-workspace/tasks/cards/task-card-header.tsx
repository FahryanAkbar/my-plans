"use client";

import React from "react";
import { 
  Badge, 
  Checkbox,
  Input
} from "@/components/atoms";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/molecules";
import { Check, Search } from "lucide-react";
import { 
  TaskType as TaskTypeEnum, 
  TaskStatus as TaskStatusEnum,
} from "@/lib";
import { 
  getTypeVisualConfig, 
  getStatusVisualConfig,
  TASK_TYPE_CONFIGURATION 
} from "@/lib/constants/feature/task-config";
import { cn } from "@/lib/utils";

interface TaskCardHeaderProps {
  type: TaskTypeEnum;
  status: TaskStatusEnum;
  isSelected?: boolean;
  isArchived?: boolean;
  onSelect?: (checked: boolean) => void;
  onUpdate?: (updates: { type?: TaskTypeEnum }) => void;
}

export const TaskCardHeader = ({
  type,
  status,
  isSelected,
  isArchived,
  onSelect,
  onUpdate,
}: TaskCardHeaderProps) => {
  const [typeQuery, setTypeQuery] = React.useState("");
  const typeEntries = React.useMemo(
    () => Object.entries(TASK_TYPE_CONFIGURATION),
    []
  );
  const filteredTypeEntries = React.useMemo(() => {
    const query = typeQuery.trim().toLowerCase();
    if (!query) return typeEntries;
    return typeEntries.filter(([key, cfg]) =>
      key.toLowerCase().includes(query) ||
      cfg.label.toLowerCase().includes(query)
    );
  }, [typeEntries, typeQuery]);

  return (
    <div className="flex items-start justify-between mb-3 gap-3">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(!!checked)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded-lg border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
        />
        <DropdownMenu onOpenChange={(open) => !open && setTypeQuery("")}>
          <DropdownMenuTrigger asChild>
            <button className="outline-none" onClick={(e) => e.stopPropagation()}>
              <Badge 
                variant="outline" 
                className={cn(
                  "h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
                  getTypeVisualConfig(type).color
                )}
              >
                {type}
              </Badge>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2 space-y-2">
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
              <Input
                value={typeQuery}
                onChange={(e) => setTypeQuery(e.target.value)}
                placeholder="Search type..."
                className="h-8 pl-7 text-xs bg-muted/30 border-border/60 focus-visible:ring-primary/20"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
              {filteredTypeEntries.length > 0 ? (
                filteredTypeEntries.map(([key, cfg]) => (
                  <DropdownMenuItem 
                    key={key}
                    className={cn(
                      "h-8 rounded-md px-2 cursor-pointer",
                      type === key && "bg-primary/10"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate?.({ type: key as TaskTypeEnum });
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.color.split(" ")[0])} />
                        <span className="text-xs font-semibold truncate">{cfg.label}</span>
                      </div>
                      {type === key && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                  No type found
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Badge 
          variant="outline" 
          className={cn(
            "h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none shadow-none whitespace-nowrap", 
            getStatusVisualConfig(status).color
          )}
        >
          {status.replace("_", " ")}
        </Badge>
        
        {isArchived && (
          <Badge variant="outline" className="px-2 py-0 text-[8px] font-bold border-dashed text-muted-foreground uppercase tracking-widest">
            Archived
          </Badge>
        )}
      </div>
    </div>
  );
};
