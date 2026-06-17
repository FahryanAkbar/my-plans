"use client";

import React from "react";
import { Check, Search } from "lucide-react";

import { format, isPast, isToday } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

import { cn, CreateTaskFormValues } from "@/lib";
import { 
  TASK_TYPE_CONFIGURATION, 
  getPriorityVisualConfig,
  TaskPriority, 
  TaskType, 
  TASK_PRIORITY
} from "@/lib/constants";

import { 
  Typography, 
  Badge, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  Input
} from "@/components/atoms";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/molecules";

const PRIORITY_TEXT_COLOR: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: "text-emerald-400",
  [TASK_PRIORITY.MEDIUM]: "text-amber-400",
  [TASK_PRIORITY.HIGH]: "text-rose-400",
  [TASK_PRIORITY.URGENT]: "text-rose-500",
};

interface TaskListItemMetadataProps {
  id: Id<"tasks">;
  type?: string;
  description?: string;
  assignee?: {
    name?: string;
    imageUrl?: string;
  };
  dueDate?: number | string;
  priority?: TaskPriority;
  onUpdate?: (id: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => void;
}

export const TaskListItemMetadata = ({
  id,
  type,
  description,
  assignee,
  dueDate,
  priority,
  onUpdate
}: TaskListItemMetadataProps) => {
  const date = dueDate ? new Date(dueDate) : null;
  const isOverdue = date ? isPast(date) && !isToday(date) : false;
  const priorityCfg = getPriorityVisualConfig(priority);

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
    <React.Fragment>
      <div className="flex items-center">
        <div className="w-6 flex items-center shrink-0" />
        <DropdownMenu onOpenChange={(open) => !open && setTypeQuery("")}>
          <DropdownMenuTrigger asChild>
            <button className="outline-none group/type">
              <Badge
                className={cn(
                  "h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
                  type && TASK_TYPE_CONFIGURATION[type as keyof typeof TASK_TYPE_CONFIGURATION]
                    ? TASK_TYPE_CONFIGURATION[type as keyof typeof TASK_TYPE_CONFIGURATION].color
                    : "bg-muted/30 text-muted-foreground"
                )}
              >
                {type || "Task"}
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
                      onUpdate?.(id, { type: key as TaskType });
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
      </div>

      <div className="min-w-0 flex items-center">
        <div className="w-6 shrink-0" />
        <Typography className="min-w-0 text-xs text-muted-foreground truncate opacity-70">
          {description || "No description"}
        </Typography>
      </div>
      <div className="min-w-0 flex items-center">
        <div className="w-6 shrink-0" />
        {assignee?.name || assignee?.imageUrl ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={assignee.imageUrl} />
            <AvatarFallback className="text-[10px] bg-muted">
              {assignee.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-muted/40 border border-dashed border-border/50">
                ??
              </AvatarFallback>
            </Avatar>
            <Typography className="text-[10px] text-muted-foreground font-semibold truncate tracking-tight">
              Unassigned
            </Typography>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <div className="w-6 shrink-0" />
        <Popover>
          <PopoverTrigger asChild>
            <button className="outline-none text-left">
              <Typography
                className={cn(
                  "text-xs whitespace-nowrap cursor-pointer hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/30",
                  isOverdue ? "text-rose-500" : "text-muted-foreground"
                )}
              >
                {date ? format(date, "MMMM d, yyyy") : "Set due date"}
              </Typography>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(newDate) => {
                if (newDate) {
                  onUpdate?.(id, { dueDate: newDate.getTime() });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center">
        <div className="w-6 shrink-0" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none group/priority">
              <Badge
                className={cn(
                  "h-5 flex items-center px-2 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
                  priorityCfg.color
                )}
              >
                {priority || "LOW"}
              </Badge>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 z-50 p-2 rounded-xl border border-border/70 bg-popover/95 backdrop-blur-sm shadow-xl"
          >
            <div className="px-1 pb-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/70">
              Set Priority
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.values(TASK_PRIORITY).map((p) => {
                const isActive = p === priority;
                return (
                  <DropdownMenuItem 
                    key={p}
                    className={cn(
                      "relative min-h-0 px-2 py-1.5 rounded-md cursor-pointer border transition-all duration-150",
                      "focus:bg-transparent hover:bg-muted/30",
                      isActive ? "border-primary/40 bg-primary/10" : "border-transparent bg-transparent"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate?.(id, { priority: p as TaskPriority });
                    }}
                  >
                    <span className={cn(
                      "text-[10px] font-bold leading-none",
                      PRIORITY_TEXT_COLOR[p as TaskPriority]
                    )}>
                      {getPriorityVisualConfig(p as TaskPriority).label}
                    </span>
                    {isActive && (
                      <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-primary" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </React.Fragment>
  );
};
