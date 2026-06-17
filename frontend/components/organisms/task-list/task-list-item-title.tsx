"use client";

import React, { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { Typography, Input } from "@/components/atoms";
import { cn, stripHtml } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { CreateTaskFormValues } from "@/lib/schema/zod/tasks/create-task";

interface TaskListItemTitleProps {
  id: Id<"tasks">;
  title: string;
  isDone: boolean;
  isSubtask?: boolean;
  canUpdate: boolean;
  onUpdate?: (id: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => void;
  onClick?: (id: Id<"tasks">) => void;
}

export const TaskListItemTitle = ({
  id,
  title,
  isDone,
  isSubtask,
  canUpdate,
  onUpdate,
  onClick
}: TaskListItemTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSubmit = () => {
    const cleanedTitle = stripHtml(editedTitle.trim());
    if (cleanedTitle && cleanedTitle !== title) {
      onUpdate?.(id, { title: cleanedTitle });
      setEditedTitle(cleanedTitle);
    } else {
      setEditedTitle(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    else if (e.key === "Escape") {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="min-w-0 flex items-center group/title">
      <div className="w-6 flex items-center shrink-0">
        {isSubtask ? (
          <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/30" />
        ) : (
          <div className="h-3.5 w-3.5" />
        )}
      </div>

      {isEditing ? (
        <Input
          autoFocus
          value={editedTitle}
          maxLength={40}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="h-7 px-2 text-sm font-semibold border-primary/50 focus-visible:ring-primary/20"
        />
      ) : (
        <Typography
          onClick={(e) => {
            if (canUpdate) {
              e.stopPropagation();
              setIsEditing(true);
            } else {
              onClick?.(id);
            }
          }}
          className={cn(
            "text-sm font-semibold truncate cursor-text hover:text-primary transition-colors",
            isDone && "text-muted-foreground line-through font-medium"
          )}
        >
          {title}
        </Typography>
      )}
    </div>
  );
};
