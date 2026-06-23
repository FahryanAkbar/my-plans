"use client";

import React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { 
  Typography, 
  Button, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  MarkdownRenderer,
} from "@/components/atoms";

import { IssueComment } from "@/types/features";
import { Id } from "@/convex/_generated/dataModel";

interface IssueCommentItemProps {
  comment: IssueComment;
  onReply?: (id: Id<"issueComments">, name: string) => void;
  onDelete?: (id: Id<"issueComments">) => void;
  isReply?: boolean;
}

export const IssueCommentItem = ({ 
  comment, 
  onReply, 
  onDelete,
  isReply = false 
}: IssueCommentItemProps) => {
  return (
    <div className={`flex gap-4 group/${isReply ? 'reply' : 'comment'} animate-in fade-in ${isReply ? 'slide-in-from-left-2' : 'slide-in-from-top-2'} duration-300`}>
      <Avatar className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} border border-border/50 shrink-0 shadow-sm`}>
        <AvatarImage src={comment.user?.imageUrl} />
        <AvatarFallback className={`${isReply ? 'text-[8px]' : 'text-[10px]'} font-bold bg-primary/5 text-primary`}>
          {comment.user?.fullName?.[0] ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography className={`${isReply ? 'text-xs' : 'text-sm'} font-bold tracking-tight`}>
              {comment.user?.fullName ?? "Unknown User"}
            </Typography>
            <span className={`${isReply ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground font-medium`}>
              • {format(comment.createdAt, "dd MMM, HH:mm")}
            </span>
          </div>
          <div className={`flex items-center gap-1 opacity-0 group-${isReply ? 'hover/reply' : 'hover/comment'}:opacity-100 transition-opacity`}>
            {!isReply && onReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onReply(comment._id, comment.user?.fullName ?? "User")}
                className="h-7 px-2 text-[10px] font-bold hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg"
              >
                Reply
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(comment._id)}
                className={`${isReply ? 'h-6 w-6' : 'h-7 w-7'} text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg`}
              >
                <Trash2 className={isReply ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
              </Button>
            )}
          </div>
        </div>
        <div className="pt-0.5">
          <MarkdownRenderer content={comment.content} />
        </div>
      </div>
    </div>
  );
};
