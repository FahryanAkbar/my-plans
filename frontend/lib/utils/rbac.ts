import { QueryCtx, MutationCtx } from "@/convex/_generated/server";
import { Id } from "@/convex/_generated/dataModel";

import { 
  ROLES, 
  Role, 
  ROLE_PERMISSIONS, 
  Permission, 
  PERMISSIONS
} from "../constants/permission";

type Ctx = QueryCtx | MutationCtx;

export const getCurrentUserOrThrow = async (ctx: Ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) =>
      q.eq("clerkId", identity.subject)
    )
    .first();

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  return user;
};

export const getProjectMember = async (
  ctx: Ctx,
  userId: Id<"users">,
  projectId: Id<"projects">
) => {
  return await ctx.db
    .query("projectMembers")
    .withIndex("by_project_and_user", (q) =>
      q.eq("projectId", projectId).eq("userId", userId)
    )
    .first();
};

export const getProjectMemberOrThrow = async (
  ctx: Ctx,
  userId: Id<"users">,
  projectId: Id<"projects">
) => {
  const member = await getProjectMember(ctx, userId, projectId);

  if (!member) {
    throw new Error("Forbidden: not a project member");
  }

  return member;
};

export const hasRole = (
  role: Role,
  allowedRoles: Role[]
) => {
  return allowedRoles.includes(role);
};

export const requireRole = (
  role: Role,
  allowedRoles: Role[]
) => {
  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden: insufficient role");
  }
};

export const hasPermission = (
  role: Role,
  permission: Permission
) => {
  return ROLE_PERMISSIONS[role]?.includes(permission);
};

export const requirePermission = (
  role: Role,
  permission: Permission
) => {
  if (!hasPermission(role, permission)) {
    throw new Error("Forbidden: insufficient permission");
  }
};

export const requireProjectManager = (role: Role) => {
  requireRole(role, [ROLES.PIC]);
};

export const requireProjectAccess = (role: Role) => {
  requireRole(role, [
    ROLES.PIC,
    ROLES.FE,
    ROLES.BE,
    ROLES.QA,
    ROLES.BA,
  ]);
};

export const requireTaskEditAccess = (
  role: Role,
  userId: Id<"users">,
  assigneeId?: Id<"users">
) => {
  if (role === ROLES.PIC) return;

  if (assigneeId && assigneeId === userId) return;

  throw new Error("Forbidden: cannot edit this task");
};

export const requireTaskUpdatePermission = (role: Role) => {
  requirePermission(role, PERMISSIONS.TASK_UPDATE);
};

export const checkProjectPermission = async (
  ctx: Ctx,
  projectId: Id<"projects">,
  permission: Permission
) => {
  const user = await getCurrentUserOrThrow(ctx);
  const member = await getProjectMemberOrThrow(ctx, user._id, projectId);
  requirePermission(member.role as Role, permission);
  return { user, member };
};

export const checkIssuePermission = async (
  ctx: Ctx,
  projectId: Id<"projects">,
  permission: Permission,
  reporterId?: Id<"users">
) => {
  const user = await getCurrentUserOrThrow(ctx);
  const member = await getProjectMemberOrThrow(ctx, user._id, projectId);
  
  const isReporter = !!(reporterId && user._id === reporterId);
  const hasGlobalPermission = hasPermission(member.role as Role, permission);

  if (!isReporter && !hasGlobalPermission) {
    throw new Error("Forbidden: insufficient permission");
  }

  return { user, member };
};
