"use client";

import React from "react";
import { Plus, MoreHorizontal, ListChecks, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { 
  Badge,
  Typography, 
  Button,
  Checkbox
} from "@/components/atoms";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/molecules";
import { cn, IssueStatus, ISSUE_STATUS, ISSUE_STATUS_LABELS, patterns, tokens } from "@/lib";
import { IssueWithDetails } from "@/hooks";
import { Id } from "@/convex/_generated/dataModel";

export interface IssueColumnProps {
  id: IssueStatus;
  title: string;
  color: string;
  issues: IssueWithDetails[];
  onAddClick?: (status: IssueStatus) => void;
  onIssueClick?: (id: string) => void;
  onEdit?: (issue: IssueWithDetails) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: Id<"issues">, checked: boolean) => void;
  onSelectAll?: (status: IssueStatus, checked: boolean) => void;
  selectedIds?: Set<Id<"issues">>;
  isAllSelected?: boolean;
  selectedCount?: number;
  onBulkDelete?: (status: IssueStatus) => void;
  onBulkStatusUpdate?: (status: IssueStatus) => void;
  onBulkArchive?: (isArchived: boolean) => void;
}

export const IssueColumnHeader = ({
  id,
  title,
  color,
  issues,
  onAddClick,
  onSelectAll,
  isAllSelected,
  selectedCount = 0,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkArchive
}: IssueColumnProps) => {
  return (
    <div className={cn("flex items-center justify-between px-2 mb-4")}>
      <div className="flex items-center gap-x-2">
        <Checkbox 
          checked={isAllSelected}
          onCheckedChange={(checked) => onSelectAll?.(id, !!checked)}
          className={cn(
            "h-4 w-4",
            tokens.radius.md,
            tokens.border.subtle,
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          )}
        />
        <div className={cn(patterns.statusDot, color)} />
        <Typography className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap">
          {title}
        </Typography>
        <Badge 
          variant="secondary" 
          className={cn(
            "bg-muted/50 text-muted-foreground/70 px-1.5 py-0 min-w-5 justify-center border-none shadow-none",
            patterns.textTinyCaps
          )}
        >
            {issues.length}
        </Badge>
      </div>
      
      <div className="flex items-center gap-x-1 opacity-0 group-hover/column:opacity-100 transition-all duration-300">
        <Button 
          onClick={() => onAddClick?.(id)}
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 group/btn",
            tokens.radius.lg
          )}
        >
          <Plus className="h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-90 group-hover/btn:scale-125" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 text-muted-foreground transition-all hover:bg-muted",
                tokens.radius.lg,
                selectedCount > 0 && "text-primary bg-primary/10"
              )}
            >
              {selectedCount > 0 ? <ListChecks className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1.5">
              Column Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAddClick?.(id)} className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Issue to Column
            </DropdownMenuItem>
            {selectedCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1.5">
                  Bulk Actions ({selectedCount})
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => onBulkDelete?.(id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 rounded-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1.5">
                  Move Selected to
                </DropdownMenuLabel>
                {Object.values(ISSUE_STATUS).filter(s => s !== id).map((status) => (
                  <DropdownMenuItem 
                    key={status}
                    onClick={() => onBulkStatusUpdate?.(status as IssueStatus)}
                    className="rounded-lg"
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-2", 
                      status === ISSUE_STATUS.OPEN ? "bg-blue-500" :
                      status === ISSUE_STATUS.IN_PROGRESS ? "bg-zinc-500" :
                      status === ISSUE_STATUS.RESOLVED ? "bg-green-500" : "bg-muted-foreground"
                    )} />
                    {ISSUE_STATUS_LABELS[status as IssueStatus]}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1.5">
                  General Actions
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => onBulkArchive?.(true)}
                  className="rounded-lg"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onBulkArchive?.(false)}
                  className="rounded-lg"
                >
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Unarchive Selected
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
