"use client";

import React, { useState } from "react";
import { Input, Typography } from "@/components/atoms";
import { Permission, PERMISSIONS } from "@/lib";
import { stripHtml } from "@/lib/utils";

interface TaskCardTitleProps {
  title: string;
  description?: string;
  can: (permission: Permission) => boolean;
  onUpdate?: (updates: { title?: string }) => void;
}

export const TaskCardTitle = ({
  title,
  description,
  can,
  onUpdate,
}: TaskCardTitleProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    e?.stopPropagation();
    const cleanedTitle = stripHtml(editedTitle.trim());
    if (cleanedTitle && cleanedTitle !== title) {
      onUpdate?.({ title: cleanedTitle });
      setEditedTitle(cleanedTitle);
    } else {
      setEditedTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="space-y-1.5 mb-4">
      {isEditingTitle ? (
        <Input
          autoFocus
          value={editedTitle}
          maxLength={40}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={() => handleTitleSubmit()}
          onKeyDown={handleTitleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="h-8 px-2 text-sm font-semibold border-primary/50 focus-visible:ring-primary/20 bg-background"
        />
      ) : (
        <Typography 
          onClick={(e) => {
            if (can(PERMISSIONS.TASK_UPDATE)) {
              e.stopPropagation();
              setIsEditingTitle(true);
            }
          }}
          className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors cursor-text"
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="muted" className="text-xs line-clamp-2">
          {description}
        </Typography>
      )}
    </div>
  );
};
