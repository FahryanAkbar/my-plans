/* eslint-disable @typescript-eslint/no-unused-vars */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { 
  getCurrentUserOrThrow, 
  getProjectMember,
  getProjectMemberOrThrow, 
  checkProjectPermission 
} from "../lib/utils/rbac";
import { PERMISSIONS } from "../lib/constants/permission/permissions";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const PRIORITY_SCORES: Record<string, number> = {
  low: 10,
  medium: 30,
  high: 70,
};

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);
    
    if (!member) {
      return [];
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const assigneeDetails: { fullName: string; imageUrl?: string }[] = [];
        const watcherDetails: { fullName: string; imageUrl?: string }[] = [];
        if (task.assigneeId) {
          try {
            const assignee = await ctx.db.get(task.assigneeId as Id<"users">);
            if (assignee) {
              assigneeDetails.push({
                fullName: assignee.fullName,
                imageUrl: assignee.imageUrl,
              });
            }
          } catch (e) {
          }
        }
        if (task.watchers?.length) {
          for (const watcherId of task.watchers) {
            try {
              const watcher = await ctx.db.get(watcherId as Id<"users">);
              if (watcher) {
                watcherDetails.push({
                  fullName: watcher.fullName,
                  imageUrl: watcher.imageUrl,
                });
              }
            } catch (e) {
            }
          }
        }
        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        return { ...task, assigneeDetails, watcherDetails, commentsCount: comments.length };
      })
    );

    return tasksWithDetails;
  },
});

export const getById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      return null;
    }

    await getProjectMemberOrThrow(ctx, user._id, task.projectId);

    const assigneeDetails: { fullName: string; imageUrl?: string }[] = [];
    const watcherDetails: { fullName: string; imageUrl?: string }[] = [];
    if (task.assigneeId) {
      try {
        const assignee = await ctx.db.get(task.assigneeId as Id<"users">);
        if (assignee) {
          assigneeDetails.push({
            fullName: assignee.fullName,
            imageUrl: assignee.imageUrl,
          });
        }
      } catch (e) {
        // Fallback
      }
    }
    if (task.watchers?.length) {
      for (const watcherId of task.watchers) {
        try {
          const watcher = await ctx.db.get(watcherId as Id<"users">);
          if (watcher) {
            watcherDetails.push({
              fullName: watcher.fullName,
              imageUrl: watcher.imageUrl,
            });
          }
        } catch (e) {
          // Fallback
        }
      }
    }

    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    return { ...task, assigneeDetails, watcherDetails, commentsCount: comments.length };
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    status: v.string(),
    priority: v.string(),
    scoreValue: v.number(),
    
    assigneeId: v.optional(v.string()),
    watchers: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user } = await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.TASK_CREATE
    );

    const now = Date.now();
    const finalScoreValue = args.scoreValue > 0 
      ? args.scoreValue 
      : (PRIORITY_SCORES[args.priority.toLowerCase()] || 10);

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      scoreValue: finalScoreValue,
      completedAt: args.status === "DONE" ? now : undefined,
      lastStatusChangedAt: args.status === "IN_PROGRESS" ? now : undefined,
      reporterId: user._id,
      createdBy: user.fullName,
      isArchived: false,
      watchers: args.watchers ?? [],
      createdAt: now,
      updatedAt: now,
    });

    // [AUDIT TRAIL] Catat pembuatan task
    await ctx.runMutation(internal.taskActivity.create, {
      taskId,
      userId: user._id,
      action: "created",
    });

    await ctx.runMutation(internal.projectActivity.createActivity, {
      projectId: args.projectId,
      taskId,
      userId: user._id,
      action: "created",
    });

    if (args.assigneeId) {
      const project = await ctx.db.get(args.projectId);
      await ctx.runMutation(internal.notifications.create, {
        userId: args.assigneeId as Id<"users">,
        senderId: user._id,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        description: `${user.fullName} assigned you to a new task: "${args.title}" in project ${project?.name}`,
        link: `/project/${args.projectId}/tasks`,
        relatedId: taskId,
      });
    }

    await ctx.runMutation(internal.project.recalculateProjectProgress, {
      projectId: args.projectId,
    });

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    type: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    watchers: v.optional(v.array(v.string())),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    scoreValue: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.union(v.number(), v.null())),
    completedAt: v.optional(v.union(v.number(), v.null())),
    isArchived: v.optional(v.boolean()),
    index: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const { user } = await checkProjectPermission(
      ctx, 
      task.projectId, 
      PERMISSIONS.TASK_UPDATE
    );

    const now = Date.now();
    
    let completedAt = updates.completedAt;
    let lastStatusChangedAt = task.lastStatusChangedAt;
    let actualHours = task.actualHours ?? 0;
    
    const targetUserId = (updates.assigneeId || task.assigneeId || user._id) as Id<"users">;
    const currentScoreValue = updates.scoreValue !== undefined ? updates.scoreValue : (task.scoreValue || 0);
    const baseScore = currentScoreValue > 0 
      ? currentScoreValue 
      : (PRIORITY_SCORES[(updates.priority || task.priority).toLowerCase()] || 10);

    if (updates.status && updates.status !== task.status) {
      if (updates.status === "IN_PROGRESS") {
        lastStatusChangedAt = now;
        
        if (!task.estimatedHours && !updates.estimatedHours) {
          updates.estimatedHours = 8;
        }
      } 
      else if (task.status === "IN_PROGRESS") {
        if (task.lastStatusChangedAt) {
          const deltaMs = now - task.lastStatusChangedAt;
          const deltaHours = deltaMs / (1000 * 60 * 60);
          actualHours = Number((actualHours + deltaHours).toFixed(2));
        }
        lastStatusChangedAt = undefined;
      }

      if (updates.status === "DONE") {
        completedAt = now;
        
        // [GAMIFIKASI] Ownership Audit (Anti-Farming)
        const MIN_EFFORT_TIME = 5 * 60 * 1000; // 5 menit
        const timeElapsed = now - task.createdAt;
        const skippedInProgress = task.status === "todo";
        const isLowEffort = timeElapsed < MIN_EFFORT_TIME && skippedInProgress;

        // [GAMIFIKASI] Hitung poin dinamis berdasarkan dueDate (Bonus & Penalti)
        if (baseScore > 0) {
          let finalScore = baseScore;
          let scoreReason = isLowEffort ? "low_effort_task_no_bonus" : "task_completed";

          // Hanya hitung bonus jika BUKAN low effort
          if (!isLowEffort) {
            if (task.dueDate) {
              const ONE_DAY = 24 * 60 * 60 * 1000;
              if (now < task.dueDate - ONE_DAY) {
                finalScore = baseScore + Math.ceil(baseScore * 0.2);
                scoreReason = "task_completed_early";
              } else if (now > task.dueDate + ONE_DAY) {
                finalScore = Math.ceil(baseScore * 0.5);
                scoreReason = "task_completed_late";
              }
            }

            const estHours = updates.estimatedHours ?? task.estimatedHours;
            const actHours = (updates.actualHours !== undefined && updates.actualHours !== null) ? updates.actualHours : (actualHours ?? 0);
            
            if (estHours && estHours > 0 && actHours > 0 && actHours < estHours) {
              const savedTimePercent = (estHours - actHours) / estHours;
              
              if (savedTimePercent >= 0.5) {
                // Selesai 50% lebih cepat: Bonus 25%
                finalScore += Math.ceil(baseScore * 0.25);
                scoreReason = scoreReason === "task_completed" ? "efficiency_pro" : `${scoreReason}_with_efficiency_pro`;
              } else if (savedTimePercent >= 0.2) {
                // Selesai 20% lebih cepat: Bonus 10%
                finalScore += Math.ceil(baseScore * 0.1);
                scoreReason = scoreReason === "task_completed" ? "efficiency_lite" : `${scoreReason}_with_efficiency_lite`;
              }
            }
          }
  
          const targetUser = await ctx.db.get(targetUserId);
            if (targetUser) {
              await ctx.db.patch(targetUserId, {
                performanceScore: (targetUser.performanceScore || 0) + finalScore,
              });
              await ctx.db.insert("scoreLogs", {
                userId: targetUserId,
                projectId: task.projectId,
                taskId: id,
                taskTitle: updates.title ?? task.title,
                taskDescription: updates.description ?? task.description,
                baseScore: baseScore,
                score: finalScore,
                reason: scoreReason,
                createdAt: now,
              });
            }
        }
      } else if (task.status === "DONE") {
        completedAt = null;
        
        // [GAMIFIKASI] Tarik kembali POIN EXACT yang diberikan terakhir kali
        // Karena sekarang poin dinamis, kita harus mengecek log terakhir
        const lastLog = await ctx.db
          .query("scoreLogs")
          .withIndex("by_user", (q) => q.eq("userId", targetUserId))
          .filter((q) => 
            q.and(
              q.eq(q.field("taskId"), id),
              q.gt(q.field("score"), 0) // Cari log penambahan poin
            )
          )
          .order("desc")
          .first();

        const scoreToRevert = lastLog ? lastLog.score : (task.scoreValue || 0);

        if (scoreToRevert > 0) {
          const targetUser = await ctx.db.get(targetUserId);
          if (targetUser) {
            await ctx.db.patch(targetUserId, {
              performanceScore: Math.max(0, (targetUser.performanceScore || 0) - (scoreToRevert + Math.ceil((task.scoreValue || 0) * 0.5))),
            });
            await ctx.db.insert("scoreLogs", {
              userId: targetUserId,
              projectId: task.projectId,
              taskId: id,
              taskTitle: updates.title ?? task.title,
              taskDescription: updates.description ?? task.description,
              baseScore: task.scoreValue || 0,
              score: -scoreToRevert,
              reason: "task_reopened_revert",
              createdAt: now,
            });
            await ctx.db.insert("scoreLogs", {
              userId: targetUserId,
              projectId: task.projectId,
              taskId: id,
              taskTitle: updates.title ?? task.title,
              taskDescription: updates.description ?? task.description,
              baseScore: task.scoreValue || 0,
              score: -Math.ceil((task.scoreValue || 0) * 0.5),
              reason: "quality_penalty_reopened",
              createdAt: now,
            });
          }
        }
      }
    } else if (task.status === "DONE" && updates.scoreValue !== undefined && updates.scoreValue !== task.scoreValue) {
      // [GAMIFIKASI] Sesuaikan poin jika nilai poin diubah pada task yang sudah DONE
      const scoreDiff = updates.scoreValue - (task.scoreValue || 0);
      if (scoreDiff !== 0) {
        const targetUser = await ctx.db.get(targetUserId);
        if (targetUser) {
          await ctx.db.patch(targetUserId, {
            performanceScore: Math.max(0, (targetUser.performanceScore || 0) + scoreDiff),
          });
          await ctx.db.insert("scoreLogs", {
            userId: targetUserId,
            projectId: task.projectId,
            taskId: id,
            taskTitle: updates.title ?? task.title,
            baseScore: task.scoreValue || 0,
            score: scoreDiff,
            reason: "score_adjusted",
            createdAt: now,
          });
        }
      }
    }

    // [GAMIFIKASI] Sinkronisasi otomatis scoreValue jika priority berubah
    // Hanya lakukan jika scoreValue saat ini adalah nilai default dari priority lama (artinya hasil auto)
    if (updates.priority && updates.priority !== task.priority) {
      const oldDefaultScore = PRIORITY_SCORES[task.priority.toLowerCase()] || 10;
      const currentScore = updates.scoreValue !== undefined ? updates.scoreValue : (task.scoreValue || 0);
      
      // Jika poin saat ini sama dengan default lama, maka update ke default baru
      if (currentScore === oldDefaultScore || currentScore === 0) {
        updates.scoreValue = PRIORITY_SCORES[updates.priority.toLowerCase()] || 10;
      }
    }

    // [AUDIT TRAIL] Catat perubahan field secara granular (Type-safe)
    const trackedFields = {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      assigneeId: updates.assigneeId,
      dueDate: updates.dueDate,
    };

    for (const [key, val] of Object.entries(trackedFields)) {
      const fieldKey = key as keyof typeof trackedFields;
      const oldValue = task[fieldKey];
      const newValue = val;

      if (newValue !== undefined && (newValue as string | number | null) !== (oldValue as string | number | null)) {
        await ctx.runMutation(internal.taskActivity.create, {
          taskId: id,
          userId: user._id,
          action: "updated",
          field: fieldKey,
          oldValue: String(oldValue ?? ""),
          newValue: String(newValue ?? ""),
        });
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      completedAt,
      lastStatusChangedAt,
      actualHours: updates.actualHours !== undefined ? updates.actualHours : actualHours,
      updatedAt: now,
    });

    if (updates.status && updates.status !== task.status) {
      await ctx.runMutation(internal.projectActivity.createActivity, {
        projectId: task.projectId,
        taskId: id,
        userId: user._id,
        action: "status_changed",
        field: "status",
        oldValue: task.status,
        newValue: updates.status,
      });
    }

    if (updates.priority && updates.priority !== task.priority) {
      await ctx.runMutation(internal.projectActivity.createActivity, {
        projectId: task.projectId,
        taskId: id,
        userId: user._id,
        action: "priority_changed",
        field: "priority",
        oldValue: task.priority,
        newValue: updates.priority,
      });
    }

    if (updates.assigneeId && updates.assigneeId !== task.assigneeId) {
      const project = await ctx.db.get(task.projectId);
      await ctx.runMutation(internal.notifications.create, {
        userId: updates.assigneeId as Id<"users">,
        senderId: user._id,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        description: `${user.fullName} assigned you to the task: "${updates.title || task.title}" in project ${project?.name}`,
        link: `/project/${task.projectId}/tasks`,
        relatedId: id,
      });
    }

    await ctx.runMutation(internal.project.recalculateProjectProgress, {
      projectId: task.projectId,
    });

    return id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    await checkProjectPermission(
      ctx, 
      task.projectId, 
      PERMISSIONS.TASK_DELETE
    );

    const activities = await ctx.db
      .query("taskActivities")
      .withIndex("by_task", (q) => q.eq("taskId", args.id))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }
    await ctx.db.delete(args.id);
    
    await ctx.runMutation(internal.project.recalculateProjectProgress, {
      projectId: task.projectId,
    });

    return args.id;
  },
});

export const archive = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const { user } = await checkProjectPermission(
      ctx, 
      task.projectId, 
      PERMISSIONS.TASK_ARCHIVE
    );

    await ctx.db.patch(args.id, {
      isArchived: true,
      updatedAt: Date.now(),
    });

    await ctx.runMutation(internal.projectActivity.createActivity, {
      projectId: task.projectId,
      taskId: args.id,
      userId: user._id,
      action: "archived",
    });

    await ctx.runMutation(internal.project.recalculateProjectProgress, {
      projectId: task.projectId,
    });

    return args.id;
  },
});

export const unarchive = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const { user } = await checkProjectPermission(
      ctx, 
      task.projectId, 
      PERMISSIONS.TASK_ARCHIVE
    );

    await ctx.db.patch(args.id, {
      isArchived: false,
      updatedAt: Date.now(),
    });

    await ctx.runMutation(internal.projectActivity.createActivity, {
      projectId: task.projectId,
      taskId: args.id,
      userId: user._id,
      action: "unarchived",
    });

    await ctx.runMutation(internal.project.recalculateProjectProgress, {
      projectId: task.projectId,
    });

    return args.id;
  },
});

export const getUserInProgress = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (memberships.length === 0) return [];

    const projectIds = memberships.map(m => m.projectId);
    
    const allTasks = await Promise.all(
      projectIds.map(projectId => 
        ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .filter((q) => q.eq(q.field("isArchived"), false))
          .collect()
      )
    );

    const tasks = allTasks.flat();
    const activeTasks = tasks.filter((task) => {
      const status = task.status.toUpperCase().replace("-", "_");
      return status !== "DONE" && status !== "COMPLETE";
    });

    activeTasks.sort((a, b) => b.updatedAt - a.updatedAt);

    const limitedTasks = activeTasks.slice(0, 10);

    const tasksWithDetails = await Promise.all(
      limitedTasks.map(async (task) => {
        const assigneeDetails: { fullName: string; imageUrl?: string }[] = [];
        if (task.assigneeId) {
          try {
            const assignee = await ctx.db.get(task.assigneeId as Id<"users">);
            if (assignee) {
              assigneeDetails.push({
                fullName: assignee.fullName,
                imageUrl: assignee.imageUrl,
              });
            }
          } catch (e) {
            // Fallback for non-ID strings
          }
        }

        const watchersDetails: { fullName: string; imageUrl?: string }[] = [];
        if (task.watchers?.length) {
          for (const watcherId of task.watchers) {
            try {
              const watcher = await ctx.db.get(watcherId as Id<"users">);
              if (watcher) {
                watchersDetails.push({
                  fullName: watcher.fullName,
                  imageUrl: watcher.imageUrl,
                });
              }
            } catch (e) {
            }
          }
        }

        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        const status = task.status.toUpperCase().replace("-", "_");
        let progress = 0;

        if (status === "DONE" || status === "COMPLETE") {
          progress = 100;
        } else if (task.estimatedHours && task.estimatedHours > 0) {
          const actual = task.actualHours ?? 0;
          progress = Math.min(Math.round((actual / task.estimatedHours) * 100), 99);
          
          if (status === "IN_PROGRESS" && progress < 10) progress = 10;
        } else {
          if (status === "IN_PROGRESS") progress = 50;
          if (status === "IN_REVIEW") progress = 90;
          if (status === "TODO") progress = 10;
        }

        const project = await ctx.db.get(task.projectId);
        
        return {
          id: task._id,
          title: task.title,
          progress,
          status: task.status.toUpperCase().replace("-", "_"),
          priority: task.priority,
          projectId: task.projectId,
          projectName: project?.name || "Unknown Project",
          comments: comments.length,
          attachments: 0,
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
          isOverdue: task.dueDate && status !== "DONE" && status !== "COMPLETE" ? Date.now() > task.dueDate : false,
          users: assigneeDetails.concat(watchersDetails),
        };
      })
    );

    return tasksWithDetails;
  },
});

