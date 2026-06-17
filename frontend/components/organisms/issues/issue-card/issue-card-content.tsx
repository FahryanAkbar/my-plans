"use client";

import React from "react";
import { Typography, Input } from "@/components/atoms";
import { IssueWithDetails } from "@/hooks";

interface IssueCardContentProps {
  issue: IssueWithDetails;
  onUpdate?: (updates: { title?: string }) => void;
}

export const IssueCardContent = ({ issue, onUpdate }: IssueCardContentProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(issue.title);

  const handleSubmit = () => {
    if (title.trim() && title !== issue.title) {
      onUpdate?.({ title: title.trim() });
    } else {
      setTitle(issue.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setTitle(issue.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-1 px-0.5 min-h-18 flex flex-col justify-start">
      {isEditing ? (
        <Input
          autoFocus
          value={title}
          maxLength={40}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="h-8 px-2 text-sm font-semibold border-primary/50 focus-visible:ring-primary/20 bg-background"
        />
      ) : (
        <Typography 
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors cursor-text"
        >
          {issue.title}
        </Typography>
      )}
      <div className="h-8">
        {issue.description ? (
          <Typography className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-tight font-medium">
            {issue.description}
          </Typography>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
    </div>
  );
};
