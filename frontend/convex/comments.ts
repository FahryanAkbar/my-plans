import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { 
  getCurrentUserOrThrow, 
  getProjectMemberOrThrow,
} from "../lib/utils/rbac";
import { Id } from "./_generated/dataModel";

export const getByTaskId = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return [];

    await getProjectMemberOrThrow(ctx, user._id, task.projectId);

    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();

    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await ctx.db.get(comment.userId);
        
        // Fetch reactions for this comment
        const reactions = await ctx.db
          .query("commentReactions")
          .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
          .collect();

        // Group reactions by emoji
        const groupedReactions = reactions.reduce((acc, reaction) => {
          const existing = acc.find(r => r.emoji === reaction.emoji);
          if (existing) {
            existing.count++;
            if (reaction.userId === user._id) existing.hasReacted = true;
            existing.userIds.push(reaction.userId);
          } else {
            acc.push({
              emoji: reaction.emoji,
              count: 1,
              hasReacted: reaction.userId === user._id,
              userIds: [reaction.userId]
            });
          }
          return acc;
        }, [] as { emoji: string, count: number, hasReacted: boolean, userIds: Id<"users">[] }[]);

        return {
          ...comment,
          user: commentUser ? {
            fullName: commentUser.fullName,
            imageUrl: commentUser.imageUrl,
          } : null,
          reactions: groupedReactions,
        };
      })
    );

    return commentsWithDetails;
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
    parentId: v.optional(v.id("taskComments")),
    mentionedUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await getProjectMemberOrThrow(ctx, user._id, task.projectId);

    const now = Date.now();
    const commentId = await ctx.db.insert("taskComments", {
      taskId: args.taskId,
      userId: user._id,
      content: args.content,
      parentId: args.parentId,
      mentionedUserIds: args.mentionedUserIds,
      createdAt: now,
      updatedAt: now,
    });
    if (args.mentionedUserIds && args.mentionedUserIds.length > 0) {
      for (const mentionedId of args.mentionedUserIds) {
        if (mentionedId === user._id) continue; 

        await ctx.runMutation(internal.notifications.create, {
          userId: mentionedId,
          senderId: user._id,
          type: "COMMENT_TAGGED",
          title: "You were mentioned",
          description: `${user.fullName} mentioned you in a comment on task: "${task.title}"`,
          link: `/project/${task.projectId}/tasks`,
          relatedId: commentId,
        });
      }
    }

    return commentId;
  },
});

export const remove = mutation({
  args: {
    id: v.id("taskComments"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== user._id) {
      throw new Error("Unauthorized to delete this comment");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getByIssueId = query({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const issue = await ctx.db.get(args.issueId);
    if (!issue) return [];

    await getProjectMemberOrThrow(ctx, user._id, issue.projectId);

    const comments = await ctx.db
      .query("issueComments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .order("desc")
      .collect();

    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await ctx.db.get(comment.userId);
        
        return {
          ...comment,
          user: commentUser ? {
            fullName: commentUser.fullName,
            imageUrl: commentUser.imageUrl,
          } : null,
          reactions: [], // Simplified for now
        };
      })
    );

    return commentsWithDetails;
  },
});

export const createForIssue = mutation({
  args: {
    issueId: v.id("issues"),
    content: v.string(),
    parentId: v.optional(v.id("issueComments")),
    mentionedUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    await getProjectMemberOrThrow(ctx, user._id, issue.projectId);

    const now = Date.now();
    const commentId = await ctx.db.insert("issueComments", {
      issueId: args.issueId,
      userId: user._id,
      content: args.content,
      parentId: args.parentId,
      mentionedUserIds: args.mentionedUserIds,
      createdAt: now,
      updatedAt: now,
    });

    if (args.mentionedUserIds && args.mentionedUserIds.length > 0) {
      for (const mentionedId of args.mentionedUserIds) {
        if (mentionedId === user._id) continue; 

        await ctx.runMutation(internal.notifications.create, {
          userId: mentionedId,
          senderId: user._id,
          type: "COMMENT_TAGGED",
          title: "You were mentioned in an issue",
          description: `${user.fullName} mentioned you in a comment on issue: "${issue.title}"`,
          link: `/project/${issue.projectId}/issues`,
          relatedId: commentId,
        });
      }
    }

    return commentId;
  },
});

export const removeIssueComment = mutation({
  args: {
    id: v.id("issueComments"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== user._id) {
      throw new Error("Unauthorized to delete this comment");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
