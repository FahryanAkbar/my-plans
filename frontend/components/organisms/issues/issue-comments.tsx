"use client";

import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";
import { useIssueComments } from "@/hooks";
import { 
  IssueComment, 
  IssueCommentWithReplies 
} from "@/types/features";

import { Typography } from "@/components/atoms";
import { IssueCommentForm } from "./issue-comments/issue-comment-form";
import { IssueCommentList } from "./issue-comments/issue-comment-list";

interface IssueCommentsProps {
  issueId: Id<"issues">;
}

export const IssueComments = ({ issueId }: IssueCommentsProps) => {
  const {
    content,
    setContent,
    setMentionedIds,
    isSubmitting,
    replyTo,
    setReplyTo,
    comments,
    mentionUsers,
    groupedComments,
    submitComment,
    handleSubmit,
    handleDelete,
  } = useIssueComments(issueId);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-2 text-muted-foreground/60 mb-4">
        <MessageSquare className="h-4 w-4" />
        <Typography variant="smallText" className="font-bold uppercase tracking-[0.2em] text-[10px]">
          Comments ({comments?.length ?? 0})
        </Typography>
      </div>

      <IssueCommentForm 
        content={content}
        setContent={setContent}
        setMentionedIds={setMentionedIds}
        isSubmitting={isSubmitting}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        mentionUsers={mentionUsers}
        submitComment={submitComment}
        handleSubmit={handleSubmit}
      />

      <IssueCommentList 
        comments={comments as IssueComment[]}
        groupedComments={groupedComments as IssueCommentWithReplies[]}
        onReply={(id, name) => setReplyTo({ id, name })}
        onDelete={handleDelete}
      />
    </div>
  );
};
