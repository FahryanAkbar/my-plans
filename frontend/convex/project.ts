import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUserOrThrow, getProjectMember } from "../lib/utils/rbac";
import { Id } from "./_generated/dataModel";
import { ROLES, USER_POSITION } from "../lib/constants/permission";
import { PROJECT_STATUS, INVITATION_DEFAULT_POSITION } from "../lib/constants/project";

type ProjectMember = {
  userId: Id<"users">;
  fullName: string;
  imageUrl?: string;
  role: string;
  position: string;
  joinedAt: number;
};

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    platform: v.string(),
    icon: v.optional(v.string()),
    isCollaborative: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    if (args.endDate && args.endDate < args.startDate) {
      throw new Error("End date cannot be before start date");
    }

    const key = `PRJ-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const inviteToken = `join_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      icon: args.icon,

      managerId: user._id,

      startDate: args.startDate,
      endDate: args.endDate,

      status: PROJECT_STATUS.PLANNING,
      progress: 0,

      platform: args.platform,

      isArchived: false,
      isCollaborative: args.isCollaborative ?? true,

      lastEditedBy: user._id,
      key,
      inviteToken,
      defaultJoinRole: ROLES.FE,
      defaultJoinPosition: INVITATION_DEFAULT_POSITION.MEMBER,

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("projectMembers", {
      projectId,
      userId: user._id,
      role: ROLES.PIC,
      position: INVITATION_DEFAULT_POSITION.ADMIN,
      joinedAt: now,
    });

    return projectId;
  },
});

export const getUserProjects = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .collect();

    const projects = await Promise.all(
      memberships.map((m) => ctx.db.get(m.projectId))
    );

    return projects.filter(Boolean);
  },
});

export const get = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const page = args.page ?? 1;
    const limit = args.limit ?? 10;

    const userMemberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const projectIds = userMemberships.map((m) => m.projectId);
    
    const projects = await Promise.all(
      projectIds.map(async (id) => await ctx.db.get(id))
    );

    let filteredProjects = projects.filter((p): p is NonNullable<typeof p> => p !== null);

    if (args.isArchived !== undefined) {
      filteredProjects = filteredProjects.filter(p => p.isArchived === args.isArchived);
    }

    if (args.status && args.status !== "all") {
      filteredProjects = filteredProjects.filter(p => p.status === args.status);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";

    filteredProjects.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] ?? 0;
      const bValue = b[sortBy as keyof typeof b] ?? 0;
      
      if (aValue === bValue) return 0;
      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    const totalElement = filteredProjects.length;
    const totalPage = Math.ceil(totalElement / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + limit);

    const enrichedProjects = await Promise.all(
      paginatedProjects.map(async (project) => {
        const stats = await ctx.db
          .query("projectStats")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .unique();

        const allMemberships = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const members = await Promise.all(
          allMemberships.map(async (m) => {
            const memberUser = await ctx.db.get(m.userId);
            return {
              fullName: memberUser?.fullName ?? "Unknown",
              imageUrl: memberUser?.imageUrl,
            };
          })
        );

        return {
          ...project,
          members,
          totalTasks: stats?.totalTasks ?? 0,
          completedTasks: stats?.completedTasks ?? 0,
        };
      })
    );

    return {
      data: enrichedProjects,
      meta: {
        current_page: page,
        total_page: totalPage,
        total_element: totalElement,
        size: limit,
      },
    };
  },
});

export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const member = await getProjectMember(
      ctx,
      user._id,
      args.projectId
    );

    if (!member) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const stats = await ctx.db
      .query("projectStats")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    return {
      ...project,
      totalTasks: stats?.totalTasks ?? 0,
      completedTasks: stats?.completedTasks ?? 0,
    };
  },
});

export const getProjectMembers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const member = await getProjectMember(ctx, user._id, args.projectId);
    if (!member) return [];

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const enrichedMembers: (ProjectMember | null)[] = await Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        if (!memberUser) return null;

        return {
          userId: membership.userId,
          fullName: memberUser.fullName,
          imageUrl: memberUser.imageUrl,
          role: membership.role,
          position: membership.position,
          joinedAt: membership.joinedAt,
          performanceScore: memberUser.performanceScore || 0,
        };
      })
    );

    return enrichedMembers.filter(
      (m): m is ProjectMember => m !== null
    );
  },
});

export const getCurrentMember = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) => 
        q.eq("projectId", args.projectId).eq("userId", user._id)
      )
      .unique();

    if (!membership) return null;

    return {
      ...membership,
      role: membership.role,
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.string()),
    progress: v.optional(v.number()),
    platform: v.optional(v.string()),
    projectImage: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isCollaborative: v.optional(v.boolean()),
    inviteMaxUses: v.optional(v.union(v.null(), v.number())),
    inviteUseCount: v.optional(v.number()), 
    inviteToken: v.optional(v.string()), // Added for link regeneration
    defaultJoinRole: v.optional(v.string()),
    defaultJoinPosition: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const { id, ...updates } = args;

    const project = await ctx.db.get(id);

    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.managerId !== user._id) {
      throw new Error("Unauthorized: Only the project manager can update this project");
    }

    const now = Date.now();

    await ctx.db.patch(id, {
      ...updates,
      lastEditedBy: user._id,
      updatedAt: now,
    });

    // Trigger recalculation to update status if dates or progress changed
    if (updates.startDate !== undefined || updates.endDate !== undefined || updates.progress !== undefined) {
      await ctx.runMutation(internal.project.recalculateProjectProgress, { projectId: id });
    }

    return id; 
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get(args.id);

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.managerId !== user._id) {
      throw new Error("Unauthorized: Only the project manager can delete this project");
    }

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const leave = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user._id)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this project");
    }

    const isManager = project.managerId === user._id;
    const isPicOrAdmin =
      membership.role === ROLES.PIC ||
      membership.position === USER_POSITION.ADMIN;

    if (isManager || isPicOrAdmin) {
      throw new Error("Project manager/admin cannot leave this project");
    }

    await ctx.db.delete(membership._id);
    return { projectId: args.projectId, left: true };
  },
});

export const removeMember = mutation({
  args: {
    projectId: v.id("projects"),
    memberUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const actorMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user._id)
      )
      .unique();

    if (!actorMembership) {
      throw new Error("Forbidden: not a project member");
    }

    const canManageMembers =
      actorMembership.role === ROLES.PIC ||
      actorMembership.position === USER_POSITION.ADMIN;

    if (!canManageMembers) {
      throw new Error("Forbidden: insufficient permission");
    }

    if (args.memberUserId === project.managerId) {
      throw new Error("Project manager cannot be removed");
    }

    if (args.memberUserId === user._id) {
      throw new Error("Use leave project to remove yourself");
    }

    const targetMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.memberUserId)
      )
      .unique();

    if (!targetMembership) {
      throw new Error("Member not found");
    }

    await ctx.db.delete(targetMembership._id);

    // Send notification to the removed member
    await ctx.runMutation(internal.notifications.create, {
      userId: args.memberUserId,
      senderId: user._id,
      type: "MEMBER_REMOVED",
      title: "Project Access Revoked",
      description: `You have been removed from the project "${project.name}" by ${user.fullName}`,
      link: "/projects",
      relatedId: args.projectId,
    });

    return { projectId: args.projectId, removedUserId: args.memberUserId };
  },
});

export const updateMember = mutation({
  args: {
    projectId: v.id("projects"),
    memberUserId: v.id("users"),
    role: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const actorMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user._id)
      )
      .unique();

    if (!actorMembership) throw new Error("Forbidden: not a project member");

    const canManageMembers =
      actorMembership.role === ROLES.PIC ||
      actorMembership.position === USER_POSITION.ADMIN;

    if (!canManageMembers) throw new Error("Forbidden: insufficient permission");

    const targetMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.memberUserId)
      )
      .unique();

    if (!targetMembership) throw new Error("Member not found");

    await ctx.db.patch(targetMembership._id, {
      role: args.role ?? targetMembership.role,
      position: args.position ?? targetMembership.position,
    });

    return targetMembership._id;
  },
});

export const recalculateProjectProgress = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const tasks = allTasks.filter((task) => !task.isArchived);

    const now = Date.now();
    let progress = 0;
    let newStatus = project.status;
    let hasStarted = false;

    if (tasks.length > 0) {
      const doneTasks = tasks.filter((t) => t.status === "DONE").length;
      progress = Math.round((doneTasks / tasks.length) * 100);
      hasStarted = tasks.some((t) => t.status !== "todo" && t.status !== "TODO");
    }

    if (progress === 100) {
      newStatus = PROJECT_STATUS.COMPLETED;
    } 
    else if (hasStarted) {
      newStatus = PROJECT_STATUS.ONGOING;
    }
    else {
      newStatus = PROJECT_STATUS.PLANNING;
    }

    if (progress < 100 && project.endDate) {
      if (now > project.endDate) {
        newStatus = PROJECT_STATUS.LATED;
      } else {
        const totalDuration = project.endDate - project.startDate;
        const elapsed = now - project.startDate;
        const timeProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
        
        const remainingTime = project.endDate - now;
        const twoDays = 2 * 24 * 60 * 60 * 1000;

        if (timeProgress > 80 && progress < 50) {
          newStatus = PROJECT_STATUS.AT_RISK;
        } else if (remainingTime < twoDays && progress < 80) {
          newStatus = PROJECT_STATUS.AT_RISK;
        } else if (newStatus === PROJECT_STATUS.LATED || newStatus === PROJECT_STATUS.AT_RISK) {
          newStatus = hasStarted ? PROJECT_STATUS.ONGOING : PROJECT_STATUS.PLANNING;
        }
      }
    } else if (progress < 100 && !project.endDate) {
        if (newStatus === PROJECT_STATUS.LATED || newStatus === PROJECT_STATUS.AT_RISK) {
            newStatus = hasStarted ? PROJECT_STATUS.ONGOING : PROJECT_STATUS.PLANNING;
        }
    }

    await ctx.db.patch(args.projectId, { 
      progress,
      status: newStatus,
      updatedAt: now
    });

    await ctx.runMutation(internal.projectStats.syncByProject, {
      projectId: args.projectId,
    });
  },
});
