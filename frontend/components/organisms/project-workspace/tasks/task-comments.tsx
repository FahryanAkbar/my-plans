"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { Typography } from "@/components/atoms";
import { 
  TaskCommentForm, 
  TaskCommentList,
} from "@/components/organisms";

import { useTaskComments } from "@/hooks";
import { GroupedComment } from "@/types/features";

interface TaskCommentsProps {
  taskId: Id<"tasks">;
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
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
    handleReaction,
  } = useTaskComments(taskId);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-2 text-muted-foreground/60 mb-4">
        <MessageSquare className="h-4 w-4" />
        <Typography variant="smallText" className="font-bold uppercase tracking-[0.2em] text-[10px]">
          Comments ({comments?.length ?? 0})
        </Typography>
      </div>

      <TaskCommentForm 
        content={content}
        setContent={setContent}
        setMentionedIds={setMentionedIds}
        isSubmitting={isSubmitting}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        mentionUsers={mentionUsers}
        onSubmit={handleSubmit}
        onKeyDownSubmit={() => void submitComment()}
      />

      <TaskCommentList 
        comments={comments}
        groupedComments={groupedComments as GroupedComment[]}
        onReply={(id, name) => setReplyTo({ id, name })}
        onDelete={handleDelete}
        onReaction={handleReaction}
      />
    </div>
  );
};
