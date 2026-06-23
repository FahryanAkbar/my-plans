import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow, getProjectMember } from "../lib/utils/rbac";

const EMPTY_STATS = {
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  overdueTasks: 0,
  completedTasksWithDueDate: 0,
  onTimeCompletedTasks: 0,
  onTimeCompletionRate: 0,
  completionRate: 0,
  updatedAt: 0,
};

type Ctx = QueryCtx | MutationCtx;

const getLatestProjectStats = async (ctx: Ctx, projectId: Id<"projects">) => {
  const rows = await ctx.db
    .query("projectStats")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .order("desc")
    .take(1);

  return rows[0] ?? null;
};

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);

    if (!member) {
      return null;
    }

    const stats = await getLatestProjectStats(ctx, args.projectId);

    return (
      stats ?? {
        projectId: args.projectId,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        completedTasksWithDueDate: 0,
        onTimeCompletedTasks: 0,
        onTimeCompletionRate: 0,
        completionRate: 0,
        updatedAt: 0,
      }
    );
  },
});

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return EMPTY_STATS;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !user.isActive) {
      return EMPTY_STATS;
    }

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (memberships.length === 0) {
      return EMPTY_STATS;
    }

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
    let completedTasksWithDueDate = 0;
    let onTimeCompletedTasks = 0;
    let latestUpdatedAt = 0;
    const now = Date.now();

    for (const membership of memberships) {
      const stats = await getLatestProjectStats(ctx, membership.projectId);

      if (stats) {
        totalTasks += stats.totalTasks;
        completedTasks += stats.completedTasks;
        inProgressTasks += stats.inProgressTasks ?? 0;
        overdueTasks += stats.overdueTasks ?? 0;
        completedTasksWithDueDate += stats.completedTasksWithDueDate ?? 0;
        onTimeCompletedTasks += stats.onTimeCompletedTasks ?? 0;
        latestUpdatedAt = Math.max(latestUpdatedAt, stats.updatedAt);
        continue;
      }

      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", membership.projectId))
        .collect();

      const activeTasks = tasks.filter((task) => !task.isArchived);
      totalTasks += activeTasks.length;
      completedTasks += activeTasks.filter((task) => task.status === "DONE").length;
      inProgressTasks += activeTasks.filter((task) => task.status === "IN_PROGRESS").length;
      overdueTasks += activeTasks.filter((task) => task.status !== "DONE" && !!task.dueDate && task.dueDate < now).length;

      for (const task of activeTasks) {
        if (task.status === "DONE" && task.dueDate && task.completedAt) {
          completedTasksWithDueDate += 1;
          if (task.completedAt <= task.dueDate) {
            onTimeCompletedTasks += 1;
          }
        }
      }
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onTimeCompletionRate =
      completedTasksWithDueDate > 0
        ? Math.round((onTimeCompletedTasks / completedTasksWithDueDate) * 100)
        : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completedTasksWithDueDate,
      onTimeCompletedTasks,
      onTimeCompletionRate,
      completionRate,
      updatedAt: latestUpdatedAt,
    };
  },
});

export const syncByProject = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const activeTasks = tasks.filter((task) => !task.isArchived);
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter((task) => task.status === "DONE").length;
    const inProgressTasks = activeTasks.filter((task) => task.status === "IN_PROGRESS").length;
    const now = Date.now();
    const overdueTasks = activeTasks.filter(
      (task) => task.status !== "DONE" && !!task.dueDate && task.dueDate < now
    ).length;
    const completedTasksWithDueDate = activeTasks.filter(
      (task) => task.status === "DONE" && !!task.dueDate && !!task.completedAt
    );
    const onTimeCompletedTasks = completedTasksWithDueDate.filter(
      (task) => (task.completedAt ?? 0) <= (task.dueDate ?? 0)
    ).length;
    const onTimeCompletionRate =
      completedTasksWithDueDate.length > 0
        ? Math.round((onTimeCompletedTasks / completedTasksWithDueDate.length) * 100)
        : 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const existing = await getLatestProjectStats(ctx, args.projectId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completedTasksWithDueDate: completedTasksWithDueDate.length,
        onTimeCompletedTasks,
        onTimeCompletionRate,
        completionRate,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("projectStats", {
      projectId: args.projectId,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completedTasksWithDueDate: completedTasksWithDueDate.length,
      onTimeCompletedTasks,
      onTimeCompletionRate,
      completionRate,
      updatedAt: now,
    });
  },
});

export const recalculate = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);

    if (!member) {
      throw new Error("Unauthorized: not a project member");
    }

    const statsId: Id<"projectStats"> = await ctx.runMutation(
      internal.projectStats.syncByProject,
      { projectId: args.projectId }
    );
    return statsId;
  },
});
