"use client";

import React from "react";
import { MoreHorizontal, Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { IssueWithDetails } from "@/hooks";
import { 
  Button, 
  Checkbox 
} from "@/components/atoms";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/molecules";

export interface IssueCardHeaderProps {
  issue: IssueWithDetails;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onEdit?: (issue: IssueWithDetails) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (updates: { isArchived?: boolean }) => void;
}

export interface IssueCardProps extends IssueCardHeaderProps {
  index: number;
  onClick?: (id: string) => void;
}

export const IssueCardHeader = ({
  issue,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onUpdate
}: IssueCardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-x-2">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(!!checked)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded-lg border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">
          #{issue._id.slice(-4).toUpperCase()}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(issue); }} className="rounded-md text-xs">
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Edit Issue
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={(e) => { 
              e.stopPropagation(); 
              onUpdate?.({ isArchived: !issue.isArchived }); 
            }} 
            className="rounded-md text-xs"
          >
            {issue.isArchived ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5 mr-2" />
                Unarchive Issue
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 mr-2" />
                Archive Issue
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 rounded-md text-xs" 
            onClick={(e) => { e.stopPropagation(); onDelete?.(issue._id); }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete Issue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
