"use client";

import React from "react";
import Image from "next/image";
import { Typography, Skeleton } from "@/components/atoms";
import { IssueCommentItem } from "./issue-comment-item";

import { IssueComment, IssueCommentWithReplies } from "@/types/features";
import { Id } from "@/convex/_generated/dataModel";

interface IssueCommentListProps {
  comments: IssueComment[] | undefined;
  groupedComments: IssueCommentWithReplies[];
  onReply: (id: Id<"issueComments">, name: string) => void;
  onDelete: (id: Id<"issueComments">) => void;
}

export const IssueCommentList = ({
  comments,
  groupedComments,
  onReply,
  onDelete
}: IssueCommentListProps) => {
  if (!comments) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
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
          <IssueCommentItem 
            comment={mainComment}
            onReply={onReply}
            onDelete={onDelete}
          />

          {mainComment.replies.length > 0 && (
            <div className="ml-10 space-y-4 border-l-2 border-border/30 pl-6 relative">
              {mainComment.replies.map((reply) => (
                <IssueCommentItem 
                  key={reply._id}
                  comment={reply}
                  onDelete={onDelete}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
