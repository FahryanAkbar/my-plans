"use client";

import React from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";

import { Typography, Skeleton } from "@/components/atoms";
import { TaskCommentItem } from "./task-comment-item";

import { GroupedComment, CommentData } from "@/types/features";
import { cn } from "@/lib";
import { patterns, tokens } from "@/lib/styles";

interface TaskCommentListProps {
  comments: CommentData[] | undefined;
  groupedComments: GroupedComment[];
  onReply: (id: Id<"taskComments">, name: string) => void;
  onDelete: (id: Id<"taskComments">) => void;
  onReaction: (id: Id<"taskComments">, emoji: string) => void;
}

export const TaskCommentList = ({
  comments,
  groupedComments,
  onReply,
  onDelete,
  onReaction,
}: TaskCommentListProps) => {
  if (!comments) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className={cn(tokens.size.avatarSm, tokens.radius.full, "shrink-0")} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedComments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative h-32 w-32 mb-4">
          <Image
            src="/comments.svg"
            fill
            alt="No comments"
            className="dark:hidden object-contain opacity-70 transition-opacity duration-300 hover:opacity-90"
            priority
          />
          <Image
            src="/comments.svg"
            fill
            alt="No comments"
            className="hidden dark:block object-contain opacity-35 transition-opacity duration-300 hover:opacity-50 mix-blend-screen"
            priority
          />
        </div>
        <div className="space-y-1">
          <Typography className="text-sm font-bold tracking-tight text-foreground/80">
            No comments yet
          </Typography>
          <Typography variant="muted" className="text-xs leading-relaxed max-w-60">
            Be the first to share your thoughts! Start the conversation by typing your message above.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedComments.map((mainComment) => (
        <div key={mainComment._id} className="space-y-4">
          <TaskCommentItem 
            comment={mainComment}
            onReply={onReply}
            onDelete={onDelete}
            onReaction={onReaction}
          />

          {mainComment.replies.length > 0 && (
            <div className={patterns.replyContainer}>
              {mainComment.replies.map((reply) => (
                <TaskCommentItem 
                  key={reply._id}
                  comment={reply}
                  isReply
                  onDelete={onDelete}
                  onReaction={onReaction}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
