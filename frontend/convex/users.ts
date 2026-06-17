import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, getProjectMember } from "../lib/utils/rbac";

export const syncUser = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        fullName: args.fullName,
        email: args.email,
        imageUrl: args.imageUrl,
        lastLoginAt: now,
        updatedAt: now,
      });

      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      fullName: args.fullName,
      email: args.email,
      imageUrl: args.imageUrl,

      performanceScore: 0,
      level: "beginner",
      isActive: true,

      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

export const getUserById = query({
  args: { 
    userId: v.id('users'), 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  }
})

export const deActivateUser = mutation ({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    await ctx.db.patch(user._id, {
      isActive: false,
      updatedAt: now,
    });

    return user._id;
  }
})

export const deleteUser = mutation ({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first();
    
    if (!user) return null;

    await ctx.db.delete(user._id);
    return user._id;
  }
})

export const getUserProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex('by_clerk_id', (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const projects = await Promise.all(
      memberships.map((m) => ctx.db.get(m.projectId))
    );

    return projects.filter(Boolean);
  },
});

export const getUserStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex('by_clerk_id', (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const recentLogs = await ctx.db
      .query("scoreLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(15); 

    return {
      performanceScore: user.performanceScore || 0,
      level: user.level || "beginner",
      recentLogs,
    };
  },
});

export const getTeamKPIByProject = query({
  args: { 
    projectId: v.id("projects"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) return [];

    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const teamKPI = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        if (!u) return null;

        const logsQuery = ctx.db
          .query("scoreLogs")
          .withIndex("by_user", (q) => q.eq("userId", m.userId));
        
        const logs = (await logsQuery.collect()).filter(log => {
          const inProject = log.projectId === args.projectId;
          const afterStart = args.startDate ? log.createdAt >= args.startDate : true;
          const beforeEnd = args.endDate ? log.createdAt <= args.endDate : true;
          return inProject && afterStart && beforeEnd;
        });

        const totalScore = logs.reduce((acc, log) => acc + log.score, 0);

        const memberTasks = await ctx.db
          .query("tasks")
          .withIndex("by_assignee", (q) => q.eq("assigneeId", m.userId as string))
          .filter((q) => q.eq(q.field("projectId"), args.projectId))
          .collect();

        const totalAssignedTasks = memberTasks.length;
        const completedTasksCount = memberTasks.filter(t => {
          const isDone = t.status.toLowerCase() === "done" || t.status.toLowerCase() === "complete";
          if (!isDone) return false;
          
          const completedAt = t.completedAt || t._creationTime;
          const afterStart = args.startDate ? completedAt >= args.startDate : true;
          const beforeEnd = args.endDate ? completedAt <= args.endDate : true;
          return afterStart && beforeEnd;
        }).length;
        
        const completionProgress = totalAssignedTasks > 0 
          ? (completedTasksCount / totalAssignedTasks) * 100 
          : 0;

        const metrics = {
          tasksCompleted: Array.from(new Set(logs.filter(l => l.taskId && l.score > 0).map(l => l.taskId))).length,
          earlyCompletions: logs.filter(l => l.reason.includes("early")).length,
          efficiencyBonuses: logs.filter(l => l.reason.includes("efficiency")).length,
          lateCompletions: logs.filter(l => l.reason.includes("late") || l.reason.includes("penalty")).length,
        };

        return {
          userId: m.userId,
          fullName: u.fullName,
          imageUrl: u.imageUrl,
          role: m.role,
          totalScore,
          completionProgress,
          metrics,
        };
      })
    );

    return teamKPI.filter((m): m is NonNullable<typeof m> => m !== null);
  },
});
