"use client";

import React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { 
  Typography, 
  Button, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  MarkdownRenderer,
} from "@/components/atoms";

import { cn } from "@/lib";
import { layouts, patterns, tokens } from "@/lib/styles";
import { CommentData } from "@/types/features";

import { TaskCommentReactions } from "./task-comment-reactions";

interface TaskCommentItemProps {
  comment: CommentData;
  isReply?: boolean;
  onReply?: (id: Id<"taskComments">, name: string) => void;
  onDelete: (id: Id<"taskComments">) => void;
  onReaction: (id: Id<"taskComments">, emoji: string) => void;
}

export const TaskCommentItem = ({
  comment,
  isReply = false,
  onReply,
  onDelete,
  onReaction,
}: TaskCommentItemProps) => {
  return (
    <div className={cn(
      "group/comment animate-in fade-in duration-300",
      isReply ? "flex gap-3 slide-in-from-left-2" : "flex gap-4 slide-in-from-top-2"
    )}>
      <Avatar className={cn(
        patterns.avatarSubtle,
        isReply ? tokens.size.avatarXs : tokens.size.avatarSm
      )}>
        <AvatarImage src={comment.user?.imageUrl} />
        <AvatarFallback className={cn(
          "font-bold",
          tokens.surface.info,
          isReply ? "text-[8px]" : "text-[10px]"
        )}>
          {comment.user?.fullName?.[0] ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-0.5">
        <div className={layouts.flexBetween}>
          <div className="flex items-center gap-2">
            <Typography className={cn(
              "font-bold tracking-tight",
              isReply ? tokens.fontSize.sm : tokens.fontSize.base
            )}>
              {comment.user?.fullName ?? "Unknown User"}
            </Typography>
            <span className={cn(
              patterns.textMeta,
              isReply && "text-[9px]"
            )}>
              • {format(comment.createdAt, "dd MMM, HH:mm")}
            </span>
          </div>
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity",
            isReply ? "group-hover/reply:opacity-100" : ""
          )}>
            {!isReply && onReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onReply(comment._id, comment.user?.fullName ?? "User")}
                className={patterns.actionButtonGhost}
              >
                Reply
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(comment._id)}
              className={cn(
                patterns.actionButtonDestructive,
                isReply && tokens.size.actionXs
              )}
            >
              <Trash2 className={isReply ? tokens.size.iconXs : tokens.size.iconSm} />
            </Button>
          </div>
        </div>
        <div className="pt-0.5">
          <MarkdownRenderer content={comment.content} />
        </div>
        <TaskCommentReactions 
          commentId={comment._id} 
          reactions={comment.reactions} 
          onReaction={onReaction} 
        />
      </div>
    </div>
  );
};
