import { v } from "convex/values";
import { query } from "./_generated/server";
import { 
  getCurrentUserOrThrow, 
  getProjectMember,
} from "../lib/utils/rbac";
import { Id } from "./_generated/dataModel";

export const getScoreLogs = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) {
      return [];
    }

    const projectLogs = await ctx.db
      .query("scoreLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const taskIds = new Set(tasks.map((t) => t._id));

    const taskLogs = await Promise.all(
      tasks.map((task) =>
        ctx.db
          .query("scoreLogs")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect()
      )
    ).then((res) => res.flat());

    // 4. Merge and deduplicate
    const logMap = new Map();
    projectLogs.forEach((l) => logMap.set(l._id, l));
    taskLogs.forEach((l) => logMap.set(l._id, l));

    let allLogs = Array.from(logMap.values());

    const isPIC = member.role === "PIC"; 
    if (!isPIC) {
      allLogs = allLogs.filter(
        (log) => log.userId === user._id || log.userId === user.clerkId
      );
    }

    allLogs.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      allLogs.map(async (log) => {
        const userId = log.userId as Id<"users">;
        let userName = "Unknown User";
        let userImageUrl = undefined;
        let taskDescription = undefined;

        const task = log.taskId ? await ctx.db.get(log.taskId as Id<"tasks">) : null;
        taskDescription = task?.description;
        
        try {
          // Try to get by ID (if it's a Convex ID)
          const actor = await ctx.db.get(userId);
          if (actor) {
            userName = actor.fullName;
            userImageUrl = actor.imageUrl;
          } else {
            // Fallback: if userId is a Clerk ID, try to find the user
            const userByClerk = await ctx.db
              .query("users")
              .withIndex("by_clerk_id", (q) => q.eq("clerkId", log.userId))
              .first();
            if (userByClerk) {
              userName = userByClerk.fullName;
              userImageUrl = userByClerk.imageUrl;
            }
          }
        } catch (e) {
          // If userId is not a valid ID format, catch and try Clerk ID lookup
          const userByClerk = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", log.userId))
            .first();
          if (userByClerk) {
            userName = userByClerk.fullName;
            userImageUrl = userByClerk.imageUrl;
          }
        }
        
        // Prioritaskan deskripsi dari snapshot log, fallback ke tabel task
        const taskDesc = (log).taskDescription || (log.taskId ? (await ctx.db.get(log.taskId as Id<"tasks">))?.description : undefined);
        
        return {
          ...log,
          userName,
          userImageUrl,
          taskDescription: taskDesc,
        };
      })
    );
  },
});

export const getUserProjectStats = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) return null;

    const projectLogs = await ctx.db
      .query("scoreLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const projectScore = projectLogs.reduce((acc, log) => acc + log.score, 0);

    return {
      projectScore,
      globalLevel: user.level || "BEGINNER",
      globalScore: user.performanceScore || 0,
      recentLogs: projectLogs.slice(0, 5),
      userId: user._id,
    };
  },
});

export const getProjectLeaderboard = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) return [];

    const projectLogs = await ctx.db
      .query("scoreLogs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Aggregate scores by user
    const scoresMap = new Map<string, number>();
    projectLogs.forEach((log) => {
      const current = scoresMap.get(log.userId) || 0;
      scoresMap.set(log.userId, current + log.score);
    });

    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const leaderboard = await Promise.all(
      projectMembers.map(async (m) => {
        const memberUser = await ctx.db.get(m.userId);
        if (!memberUser) return null;

        return {
          userId: m.userId,
          fullName: memberUser.fullName,
          imageUrl: memberUser.imageUrl,
          role: m.role,
          projectScore: scoresMap.get(m.userId) || 0,
          globalLevel: memberUser.level || "BEGINNER",
        };
      })
    );

    return leaderboard
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => b.projectScore - a.projectScore);
  },
});
