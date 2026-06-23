import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "../lib/utils/rbac";
import { Id } from "./_generated/dataModel";

/**
 * Mencatat aktivitas detail di dalam sebuah task (Audit Trail)
 */
export const create = internalMutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.string(),
    action: v.string(),
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("taskActivities", {
      taskId: args.taskId,
      userId: args.userId,
      action: args.action,
      field: args.field,
      oldValue: args.oldValue,
      newValue: args.newValue,
      createdAt: Date.now(),
    });
  },
});

/**
 * Mengambil riwayat aktivitas untuk sebuah task tertentu
 */
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);

    const activities = await ctx.db
      .query("taskActivities")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();

    return await Promise.all(
      activities.map(async (activity) => {
        // Mencari user berdasarkan Clerk ID atau Convex ID
        let user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", activity.userId))
          .unique();

        if (!user) {
          // Jika bukan Clerk ID, coba asumsikan ini adalah Convex ID
          try {
            user = await ctx.db.get(activity.userId as Id<"users">);
          } catch (e) {
            user = null;
          }
        }

        return {
          ...activity,
          userName: user?.fullName || "System",
          userImage: user?.imageUrl,
        };
      })
    );
  },
});
