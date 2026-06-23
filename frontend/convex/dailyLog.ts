import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkProjectPermission } from "../lib/utils/rbac";
import { PERMISSIONS } from "../lib/constants/permission/permissions";

export const upsert = mutation({
  args: {
    projectId: v.id("projects"),
    date: v.number(),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.DAILY_LOG_CREATE
    );

    const now = Date.now();

    const existingLog = await ctx.db
      .query("dailyLogs")
      .withIndex("by_project_and_date", (q) => 
        q.eq("projectId", args.projectId).eq("date", args.date)
      )
      .first();

    if (existingLog) {
      await ctx.db.patch(existingLog._id, {
        title: args.title,
        content: args.content,
        updatedAt: now,
      });
      return existingLog._id;
    } else {
      return await ctx.db.insert("dailyLogs", {
        projectId: args.projectId,
        userId: user._id,
        date: args.date,
        title: args.title,
        content: args.content,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const clearAll = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.PROJECT_DELETE
    );

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_project_and_date", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});

export const getLogByDate = query({
  args: {
    projectId: v.id("projects"),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.DAILY_LOG_VIEW
    );

    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_project_and_date", (q) => 
        q.eq("projectId", args.projectId).eq("date", args.date)
      )
      .first();
  },
});

export const getByDate = query({
  args: {
    projectId: v.id("projects"),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const { user } = await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.DAILY_LOG_VIEW
    );

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_project_and_date", (q) => 
        q.eq("projectId", args.projectId).eq("date", args.date)
      )
      .collect();

    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const logUser = await ctx.db.get(log.userId);
        return {
          ...log,
          user: {
            fullName: logUser?.fullName || "Unknown",
            imageUrl: logUser?.imageUrl,
          }
        };
      })
    );

    return enrichedLogs;
  },
});

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { user } = await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.DAILY_LOG_VIEW
    );

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_project_and_date", (q) => 
        q.eq("projectId", args.projectId)
      )
      .collect();

    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const logUser = await ctx.db.get(log.userId);
        return {
          ...log,
          user: {
            fullName: logUser?.fullName || "Unknown",
            imageUrl: logUser?.imageUrl,
          }
        };
      })
    );

    return enrichedLogs;
  },
});

export const searchLogs = query({
  args: {
    projectId: v.id("projects"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.length < 2) return [];

    await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.DAILY_LOG_VIEW
    );

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_project_and_date", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const searchTerm = args.query.toLowerCase();

    return logs
      .filter((log) => 
        log.title?.toLowerCase().includes(searchTerm) || 
        log.content?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5) 
      .map((log) => ({
        _id: log._id,
        title: log.title || "Untitled Log",
        date: log.date,
      }));
  },
}); 

