"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Typography, Button } from "@/components/atoms";
import { cn, patterns } from "@/lib";

interface IssueColumnEmptyProps {
  onAddClick?: () => void;
}

export const IssueColumnEmpty = ({ onAddClick }: IssueColumnEmptyProps) => {
  return (
    <Button 
      variant="unstyled"
      size="none"
      onClick={onAddClick}
      className={cn(patterns.emptyState, "min-h-45 hover:shadow-xl hover:shadow-primary/5")}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={cn(patterns.iconBoxLarge, "mb-4")}>
        <Plus className="h-5 w-5 text-muted-foreground/70 group-hover:text-primary group-hover:scale-125 group-hover:rotate-90 transition-all duration-700 ease-in-out" />
      </div>
      <Typography className={cn("relative z-10 text-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary/60 tracking-[0.2em]", patterns.textTinyCaps)}>
        No issues yet
      </Typography>
    </Button>
  );
};
