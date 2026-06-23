"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge, Typography } from "@/components/atoms";
import { cn } from "@/lib";

const SUGGESTED_TAGS = [
  "BUG", "IMPROVEMENT", "UI/UX", "BACKEND", "FRONTEND", "SECURITY", "HIGH-PRIORITY", "REFACTOR"
];

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, onChange, placeholder = "Add label..." }: TagInputProps) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim();
      if (val && !tags.includes(val)) {
        if (tags.length >= 7) return;
        onChange([...tags, val]);
        setInput("");
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter((t) => t !== tag));
    } else {
      if (tags.length >= 7) return;
      onChange([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-3 w-full">
      <div className={cn(
        "flex flex-wrap gap-2 p-2 min-h-11 rounded-xl bg-muted/20 border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all",
        tags.length > 0 && "pb-2"
      )}>
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="pl-2 pr-1 py-0.5 gap-1 bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-wider group animate-in zoom-in-95 duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={cn(
            "flex-1 bg-transparent border-none focus:ring-0 text-sm p-1 min-w-30 placeholder:text-muted-foreground/40 outline-none",
            tags.length >= 7 && "cursor-default"
          )}
          readOnly={tags.length >= 7}
        />
      </div>

      <div className="pt-3 mt-1 border-t border-border/10">
        <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3 block">
          or choose existing tags
        </Typography>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "cursor-pointer px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-all duration-200 border-muted-foreground/10",
                  isSelected 
                    ? "bg-primary/10 text-primary border-primary/30 shadow-sm" 
                    : "text-muted-foreground/40 hover:text-foreground hover:bg-muted hover:border-muted-foreground/20"
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};
