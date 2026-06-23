"use client";

import React from "react";
import { 
  Share2, 
  Maximize2, 
  RotateCw, 
} from "lucide-react";

import { 
  Typography, 
  Badge, 
  Button, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  AvatarGroup,
  Skeleton
} from "@/components/atoms";
import { cn, getSyncStatusMessage } from "@/lib";
import { Member } from "@/types";

interface HeaderBadge {
  label: string;
  icon?: React.ElementType;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

interface DailyLogDocumentHeaderProps {
  title: string;
  lastSynced?: number;
  badges?: HeaderBadge[];
  activeMembers?: Member[];
  onShare?: () => void;
  onExpand?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  onTitleChange?: (value: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const DailyLogDocumentHeader = ({
  title,
  lastSynced,
  badges = [],
  activeMembers = [],
  onShare,
  onExpand,
  onSave,
  onTitleChange,
  isLoading,
  className
}: DailyLogDocumentHeaderProps) => {
  const syncMessage = getSyncStatusMessage(lastSynced, isLoading);

  return (
    <header className={cn("space-y-6 animate-in fade-in slide-in-from-top-4 duration-700", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
            <RotateCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
            <Typography className="text-[10px] font-bold tracking-wider uppercase opacity-70">
              {syncMessage}
            </Typography>
          </div>

          {activeMembers.length > 0 && (
            <div className="flex items-center gap-x-2 pl-2 border-l border-border/50">
               <AvatarGroup>
                {activeMembers.map((member) => (
                  <Avatar key={member._id} size="sm" className="border-2 border-background ring-1 ring-border/50">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-[8px]">{member.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          <Button variant="ghost" size="icon" onClick={onShare} className="h-8 w-8 text-muted-foreground/60 hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onExpand} className="h-8 w-8 text-muted-foreground/60 hover:text-foreground">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

      </div>

      <div className="space-y-4 pt-4">
        {isLoading ? (
          <Skeleton className="h-14 w-3/4 rounded-2xl" />
        ) : (
          <textarea
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Daily Progress"
            rows={1}
            className="w-full bg-transparent border-none outline-none resize-none text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight placeholder:text-muted-foreground/20 focus:ring-0 p-0 overflow-hidden scrollbar-hide"
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <Badge 
                  key={index} 
                  variant={badge.variant || "secondary"}
                  className="px-3 py-1 rounded-lg gap-x-1.5 font-medium border-transparent shadow-sm"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
