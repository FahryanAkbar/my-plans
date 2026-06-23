import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalMutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, getProjectMember } from "../lib/utils/rbac";

export const createActivity = internalMutation({
  args: {
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
    action: v.string(),
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projectActivities", {
      projectId: args.projectId,
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

export const getByProject = query({
  args: {
    paginationOpts: paginationOptsValidator,
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const activities = await ctx.db
      .query("projectActivities")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      activities.page.map(async (activity) => {
        const actor = await ctx.db.get(activity.userId);
        const task = activity.taskId ? await ctx.db.get(activity.taskId) : null;
        
        return {
          ...activity,
          userName: actor?.fullName || "System",
          userImage: actor?.imageUrl,
          taskTitle: task?.title || "Project",
        };
      })
    );

    return {
      ...activities,
      page,
    };
  },
});

export const getActivityCountsByDate = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) return {};

    const activities = await ctx.db
      .query("projectActivities")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const stats: Record<string, { count: number, samples: string[] }> = {};
    
    for (const act of activities) {
      const date = new Date(act.createdAt).toISOString().split('T')[0];
      
      if (!stats[date]) {
        stats[date] = { count: 0, samples: [] };
      }
      
      stats[date].count++;
      
      // Ambil maksimal 3 sampel judul aktivitas per hari
      if (stats[date].samples.length < 3) {
        let title = "Project";
        if (act.taskId) {
          const task = await ctx.db.get(act.taskId);
          if (task) title = task.title;
        }
        stats[date].samples.push(`${act.action.replace('_', ' ')}: ${title}`);
      }
    }

    return stats;
  },
});
