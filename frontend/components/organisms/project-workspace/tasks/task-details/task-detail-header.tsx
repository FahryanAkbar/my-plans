"use client";

import React from "react";
import { X, Pencil, MoreHorizontal } from "lucide-react";
import { 
  Button, 
  Typography 
} from "@/components/atoms";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/molecules";

interface TaskDetailHeaderProps {
  onClose: () => void;
  onEdit?: () => void;
}

export const TaskDetailHeader = ({ onClose, onEdit }: TaskDetailHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 hover:bg-muted rounded-xl transition-all active:scale-90"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border/50 mx-1" />
        <div className="flex items-center gap-2">
          <Typography className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">
            Task Details
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="h-8 px-3 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5 text-xs font-bold transition-all"
        >
          <Pencil className="h-3.5 w-3.5 mr-2" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-xl transition-all">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2">
            <DropdownMenuItem onClick={onEdit} className="rounded-lg">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
