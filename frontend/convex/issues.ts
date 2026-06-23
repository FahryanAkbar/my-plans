import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { 
  getCurrentUserOrThrow, 
  getProjectMember,
  getProjectMemberOrThrow, 
  checkProjectPermission,
  checkIssuePermission,
  hasPermission
} from "../lib/utils/rbac";
import { PERMISSIONS, type Role } from "../lib/constants/permission";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ISSUE_STATUS, ISSUE_SEVERITY } from "../lib/constants/issue/issue";

const SEVERITY_SCORES: Record<string, number> = {
  [ISSUE_SEVERITY.LOW]: 10,
  [ISSUE_SEVERITY.MEDIUM]: 30,
  [ISSUE_SEVERITY.HIGH]: 70,
  [ISSUE_SEVERITY.CRITICAL]: 150,
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

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const issuesWithDetails = await Promise.all(
      issues.map(async (issue) => {
        const reporter = await ctx.db.get(issue.reporterId as Id<"users">);
        
        let assignee = null;
        if (issue.assigneeId) {
          assignee = await ctx.db.get(issue.assigneeId as Id<"users">);
        }

        return { 
          ...issue, 
          reporterDetails: reporter ? { fullName: reporter.fullName, imageUrl: reporter.imageUrl } : null,
          assigneeDetails: assignee ? { fullName: assignee.fullName, imageUrl: assignee.imageUrl } : null,
          linkedTaskDetails: issue.linkedTaskId ? await ctx.db.get(issue.linkedTaskId) : null,
        };
      })
    );

    return issuesWithDetails;
  },
});

export const getById = query({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const issue = await ctx.db.get(args.issueId);

    if (!issue) {
      return null;
    }

    await getProjectMemberOrThrow(ctx, user._id, issue.projectId);

    const reporter = await ctx.db.get(issue.reporterId as Id<"users">);

    let assignee = null;
    if (issue.assigneeId) {
      assignee = await ctx.db.get(issue.assigneeId as Id<"users">);
    }

    return { 
      ...issue, 
      reporterDetails: reporter ? { fullName: reporter.fullName, imageUrl: reporter.imageUrl } : null,
      assigneeDetails: assignee ? { fullName: assignee.fullName, imageUrl: assignee.imageUrl } : null,
      linkedTaskDetails: issue.linkedTaskId ? await ctx.db.get(issue.linkedTaskId) : null,
    };
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    severity: v.string(),
    status: v.string(),
    priority: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
    linkedTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const { user } = await checkProjectPermission(
      ctx, 
      args.projectId, 
      PERMISSIONS.ISSUE_CREATE
    );

    const now = Date.now();
    
    const issueId = await ctx.db.insert("issues", {
      ...args,
      reporterId: user._id,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    // [GAMIFICATION] Bug Bounty Score for reporter
    const severityScore = SEVERITY_SCORES[args.severity.toUpperCase()] || 10;
    const bountyScore = Math.ceil(severityScore * 0.5);

    await ctx.db.patch(user._id, {
      performanceScore: (user.performanceScore || 0) + bountyScore,
    });

    await ctx.db.insert("scoreLogs", {
      userId: user._id,
      projectId: args.projectId,
      taskTitle: `Reported Issue: ${args.title}`,
      taskDescription: args.description || "Bug report submitted for review",
      score: bountyScore,
      reason: "bug_reported_bounty",
      createdAt: now,
    });

    // [AUDIT TRAIL]
    await ctx.runMutation(internal.issueActivity.create, {
      issueId,
      userId: user._id,
      action: "created",
    });

    await ctx.runMutation(internal.projectActivity.createActivity, {
      projectId: args.projectId,
      userId: user._id,
      action: "issue_created",
    });

    if (args.assigneeId) {
      const assigneeUser = await ctx.db.get(args.assigneeId as Id<"users">);

      if (assigneeUser) {
        await ctx.runMutation(internal.notifications.create, {
          userId: assigneeUser._id,
          senderId: user._id,
          type: "STATUS_CHANGED",
          title: "New Issue Assigned",
          description: `${user.fullName} assigned you to an issue: "${args.title}"`,
          link: `/project/${args.projectId}/issues`,
          relatedId: issueId,
        });
      }
    }

    return issueId;
  },
});

export const update = mutation({
  args: {
    id: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    severity: v.optional(v.string()),
    priority: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
    linkedTaskId: v.optional(v.union(v.id("tasks"), v.null())),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const issue = await ctx.db.get(id);

    if (!issue) {
      throw new Error("Issue not found");
    }

    const { user } = await checkIssuePermission(
      ctx, 
      issue.projectId, 
      PERMISSIONS.ISSUE_UPDATE,
      issue.reporterId as Id<"users">
    );

    const now = Date.now();

    // [GAMIFICATION] Scoring for resolving issue
    if (updates.status === ISSUE_STATUS.RESOLVED && issue.status !== ISSUE_STATUS.RESOLVED) {
      const targetAssigneeId = (updates.assigneeId || issue.assigneeId) as Id<"users">;
      if (targetAssigneeId) {
        const assigneeUser = await ctx.db.get(targetAssigneeId);

        if (assigneeUser) {
          const severity = updates.severity || issue.severity;
          const resolutionScore = SEVERITY_SCORES[severity.toUpperCase()] || 10;

          await ctx.db.patch(assigneeUser._id, {
            performanceScore: (assigneeUser.performanceScore || 0) + resolutionScore,
          });

          await ctx.db.insert("scoreLogs", {
            userId: assigneeUser._id,
            projectId: issue.projectId,
            taskTitle: `Resolved Issue: ${updates.title || issue.title}`,
            taskDescription: updates.description || issue.description || "Issue successfully resolved",
            score: resolutionScore,
            reason: "issue_resolved",
            createdAt: now,
          });

          await ctx.runMutation(internal.projectActivity.createActivity, {
            projectId: issue.projectId,
            userId: user._id,
            action: "issue_resolved",
            taskId: issue.linkedTaskId ?? undefined,
            oldValue: issue.status,
            newValue: updates.status,
          });
        }
      }
    }

    // [AUDIT TRAIL]
    const trackedFields = {
      title: updates.title,
      status: updates.status,
      severity: updates.severity,
      priority: updates.priority,
      assigneeId: updates.assigneeId,
    };

    for (const [key, val] of Object.entries(trackedFields)) {
      const fieldKey = key as keyof typeof trackedFields;
      const oldValue = issue[fieldKey];
      const newValue = val;

      if (newValue !== undefined && newValue !== oldValue) {
        await ctx.runMutation(internal.issueActivity.create, {
          issueId: id,
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
      updatedAt: now,
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);
    if (!issue) {
      throw new Error("Issue not found");
    }

    await checkIssuePermission(
      ctx, 
      issue.projectId, 
      PERMISSIONS.ISSUE_UPDATE,
      issue.reporterId as Id<"users">
    );

    const activities = await ctx.db
      .query("issueActivities")
      .withIndex("by_issue", (q) => q.eq("issueId", args.id))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const removeBulk = mutation({
  args: { 
    ids: v.array(v.id("issues")),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMemberOrThrow(ctx, user._id, args.projectId);
    const hasGlobalUpdate = hasPermission(member.role as Role, PERMISSIONS.ISSUE_UPDATE);

    for (const id of args.ids) {
      const issue = await ctx.db.get(id);
      if (issue && issue.projectId === args.projectId) {
        if (issue.reporterId !== user._id && !hasGlobalUpdate) continue;
        const activities = await ctx.db
          .query("issueActivities")
          .withIndex("by_issue", (q) => q.eq("issueId", id))
          .collect();

        for (const activity of activities) {
          await ctx.db.delete(activity._id);
        }

        await ctx.db.delete(id);
      }
    }

    return args.ids;
  },
});
export const updateBulkStatus = mutation({
  args: {
    ids: v.array(v.id("issues")),
    projectId: v.id("projects"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMemberOrThrow(ctx, user._id, args.projectId);
    const hasGlobalUpdate = hasPermission(member.role as Role, PERMISSIONS.ISSUE_UPDATE);

    const now = Date.now();
    
    for (const id of args.ids) {
      const issue = await ctx.db.get(id);
      if (issue && issue.projectId === args.projectId) {
        if (issue.reporterId !== user._id && !hasGlobalUpdate) continue;
        const oldStatus = issue.status;
        
        // Skip if status is already same
        if (oldStatus === args.status) continue;

        // [GAMIFICATION] Scoring for resolving issue
        if (args.status === ISSUE_STATUS.RESOLVED) {
          const targetAssigneeId = issue.assigneeId as Id<"users">;
          if (targetAssigneeId) {
            const assigneeUser = await ctx.db.get(targetAssigneeId);

            if (assigneeUser) {
              const resolutionScore = SEVERITY_SCORES[issue.severity.toUpperCase()] || 10;

              await ctx.db.patch(assigneeUser._id, {
                performanceScore: (assigneeUser.performanceScore || 0) + resolutionScore,
              });

              await ctx.db.insert("scoreLogs", {
                userId: assigneeUser._id,
                projectId: issue.projectId,
                taskTitle: `Resolved Issue (Bulk): ${issue.title}`,
                taskDescription: issue.description || "Issue successfully resolved via bulk action",
                score: resolutionScore,
                reason: "issue_resolved",
                createdAt: now,
              });
            }
          }
        }

        // [AUDIT TRAIL]
        await ctx.runMutation(internal.issueActivity.create, {
          issueId: id,
          userId: user._id,
          action: "updated",
          field: "status",
          oldValue: oldStatus,
          newValue: args.status,
        });

        await ctx.db.patch(id, {
          status: args.status,
          updatedAt: now,
        });
      }
    }

    return args.ids;
  },
});
export const updateBulkArchive = mutation({
  args: {
    ids: v.array(v.id("issues")),
    projectId: v.id("projects"),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMemberOrThrow(ctx, user._id, args.projectId);
    const hasGlobalUpdate = hasPermission(member.role as Role, PERMISSIONS.ISSUE_UPDATE);

    const now = Date.now();
    
    for (const id of args.ids) {
      const issue = await ctx.db.get(id);
      if (issue && issue.projectId === args.projectId) {
        if (issue.reporterId !== user._id && !hasGlobalUpdate) continue;
        if (issue.isArchived === args.isArchived) continue;

        // [AUDIT TRAIL]
        await ctx.runMutation(internal.issueActivity.create, {
          issueId: id,
          userId: user._id,
          action: args.isArchived ? "archived" : "unarchived",
          field: "isArchived",
          oldValue: String(issue.isArchived),
          newValue: String(args.isArchived),
        });

        await ctx.db.patch(id, {
          isArchived: args.isArchived,
          updatedAt: now,
        });
      }
    }

    return args.ids;
  },
});
