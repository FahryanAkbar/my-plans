import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { MentionUser } from "@/components/molecules";
import { stripHtml } from "@/lib/utils";

export const useIssueComments = (issueId: Id<"issues">) => {
  const [content, setContent] = useState("");
  const [mentionedIds, setMentionedIds] = useState<Id<"users">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: Id<"issueComments">, name: string } | null>(null);

  const issue = useQuery(api.issues.getById, { issueId });
  const members = useQuery(api.project.getProjectMembers, issue?.projectId ? { projectId: issue.projectId } : "skip");
  const comments = useQuery(api.comments.getByIssueId, { issueId });
  
  const createComment = useMutation(api.comments.createForIssue);
  const removeComment = useMutation(api.comments.removeIssueComment);

  const mentionUsers: MentionUser[] = React.useMemo(() => 
    members?.map(m => ({
      id: m.userId,
      fullName: m.fullName,
      imageUrl: m.imageUrl
    })) || [], [members]
  );

  const groupedComments = React.useMemo(() => {
    if (!comments) return [];
    
    const mainComments = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);

    return mainComments.map(main => ({
      ...main,
      replies: replies.filter(r => r.parentId === main._id).sort((a, b) => a.createdAt - b.createdAt)
    }));
  }, [comments]);

  const submitComment = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalContent = stripHtml(content.trim());
      mentionUsers.forEach(user => {
        const escapedName = user.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`@${escapedName}`, 'g');
        finalContent = finalContent.replace(regex, `[@${user.fullName}](mention:${user.id})`);
      });

      await createComment({
        issueId,
        content: finalContent,
        parentId: replyTo?.id,
        mentionedUserIds: mentionedIds,
      });
      setContent("");
      setMentionedIds([]);
      setReplyTo(null);
    } catch (error) {
      toast.error("Failed to post comment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitComment();
  };

  const handleDelete = async (id: Id<"issueComments">) => {
    try {
      await removeComment({ id });
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error(error);
    }
  };

  return {
    content,
    setContent,
    mentionedIds,
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
  };
};
