"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { 
  Button,
  Typography,
  Input,
  Card
} from "@/components/atoms";
import { cn } from "@/lib/utils";

interface TaskListQuickAddProps {
  onAdd: (title: string) => void;
  placeholder?: string;
  variant?: "minimal" | "placeholder";
  className?: string;
}

export const TaskListQuickAdd = ({
  onAdd,
  placeholder = "Add a task...",
  variant = "minimal",
  className
}: TaskListQuickAddProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue("");
    }
  };

  if (!isEditing) {
    if (variant === "placeholder") {
      return (
        <Button
          variant="unstyled"
          size="none"
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-y-3 py-10 w-full border border-dashed border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/40 hover:bg-primary/2 transition-all duration-300 rounded-2xl group cursor-pointer",
            className
          )}
        >
          <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300">
            <Plus className="h-4 w-4 transition-all group-hover:rotate-90 duration-500 opacity-70 group-hover:opacity-100" />
          </div>
          <Typography className="text-[10px] font-black opacity-70 group-hover:opacity-100 uppercase tracking-[0.2em] transition-all duration-300 text-foreground">
            {placeholder || "No tasks yet"}
          </Typography>
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className={cn(
          "flex items-center justify-start gap-x-2 px-4 py-3 w-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-xl group font-medium",
          className
        )}
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        New task
      </Button>
    );
  }

  return (
    <Card className={cn(
      "p-2 bg-muted/20 border-primary/20 rounded-xl animate-in fade-in zoom-in-95 duration-200 shadow-sm",
      className
    )}>
      <Input
        ref={inputRef}
        value={value}
        maxLength={40}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium h-9"
      />
      
      <div className="flex items-center justify-between px-1 mt-1">
        <div className="flex items-center gap-x-1">
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="h-7 px-3 text-[11px] font-bold rounded-lg"
          >
            Add Task
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(false)}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-x-1.5 text-[10px] text-muted-foreground font-bold opacity-40 pr-1">
          <span className="flex items-center gap-x-1">
            Press <kbd className="bg-muted px-1.5 py-0.5 rounded-md border border-border shadow-xs text-[9px]">Enter</kbd> to save
          </span>
        </div>
      </div>
    </Card>
  );
};
