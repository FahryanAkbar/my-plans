import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = internalMutation({
  args: {
    issueId: v.id("issues"),
    userId: v.string(),
    action: v.string(),
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("issueActivities", {
      issueId: args.issueId,
      userId: args.userId,
      action: args.action,
      field: args.field,
      oldValue: args.oldValue,
      newValue: args.newValue,
      createdAt: Date.now(),
    });
  },
});
export const getByIssueId = query({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("issueActivities")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .order("desc")
      .collect();

    return Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId as Id<"users">);
        return {
          ...activity,
          user: user ? { fullName: user.fullName, imageUrl: user.imageUrl } : null,
        };
      })
    );
  },
});

export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Get all issues for the project
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (issues.length === 0) return [];

    const issueIds = issues.map(i => i._id);

    // 2. Get activities for these issues
    const activities = await ctx.db
      .query("issueActivities")
      .filter((q) => 
        q.or(
          ...issueIds.map(id => q.eq(q.field("issueId"), id))
        )
      )
      .order("desc")
      .take(50); // Limit to latest 50

    return Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId as Id<"users">);
        const issue = await ctx.db.get(activity.issueId);
        return {
          ...activity,
          issueTitle: issue?.title,
          user: user ? { fullName: user.fullName, imageUrl: user.imageUrl } : null,
        };
      })
    );
  },
});
