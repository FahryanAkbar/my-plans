import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id, type Doc } from "./_generated/dataModel";

import { INVITATION_STATUS, INVITATION_DEFAULT_POSITION } from "../lib/constants/project/invitation";
import { PERMISSIONS } from "../lib/constants/permission/permissions";
import { ROLES } from "../lib/constants/permission/roles";
import type { Role } from "../lib/constants/permission/roles";
import type { InvitationStatus } from "../lib/constants/project/invitation";
import {
  getCurrentUserOrThrow,
  getProjectMemberOrThrow,
  getProjectMember,
  requirePermission,
  hasPermission,
} from "../lib/utils/rbac";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_VALUES = Object.values(ROLES);
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type InviteInput = {
  email: string;
  position: string;
  role: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createInvitationToken = () =>
  `inv_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

const INVITATION_STATUS_VALUES = Object.values(INVITATION_STATUS);

const isValidInvitationStatus = (
  value: string,
): value is InvitationStatus =>
  INVITATION_STATUS_VALUES.includes(
    value as (typeof INVITATION_STATUS_VALUES)[number],
  );

export const inviteMembers = mutation({
  args: {
    projectId: v.id("projects"),
    invites: v.array(
      v.object({
        email: v.string(),
        position: v.string(),
        role: v.string(),
      }),
    ),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const membership = await getProjectMemberOrThrow(ctx, user._id, args.projectId);

    requirePermission(membership.role as Role, PERMISSIONS.MEMBER_INVITE);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.inviteToken) {
      const newToken = `join_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      await ctx.db.patch(args.projectId, { inviteToken: newToken });
      console.log(`Generated new project invite token for project ${args.projectId}`);
    }

    if (args.invites.length === 0) {
      throw new Error("At least one invite is required");
    }

    const expiresInDays = Math.max(1, Math.floor(args.expiresInDays ?? 7));
    const now = Date.now();
    const expiresAt = now + expiresInDays * ONE_DAY_MS;

    const normalizedInvites: InviteInput[] = args.invites.map((invite) => ({
      email: normalizeEmail(invite.email),
      position: invite.position.trim(),
      role: invite.role.trim(),
    }));

    for (const invite of normalizedInvites) {
      if (!invite.email) {
        throw new Error("Invitation email is required");
      }
      if (!EMAIL_REGEX.test(invite.email)) {
        throw new Error(`Invalid invitation email: ${invite.email}`);
      }
      if (!ROLE_VALUES.includes(invite.role as (typeof ROLE_VALUES)[number])) {
        throw new Error(`Invalid invitation role: ${invite.role}`);
      }
    }

    const uniqueByEmail = new Map<string, InviteInput>();
    for (const invite of normalizedInvites) {
      uniqueByEmail.set(invite.email, invite);
    }
    const uniqueInvites = Array.from(uniqueByEmail.values());

    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const existingUsers = await Promise.all(
      projectMembers.map(async (member) => {
        const memberUser = await ctx.db.get(member.userId);
        return memberUser;
      }),
    );

    const memberEmails = new Set(
      existingUsers
        .filter((u): u is Doc<"users"> => u !== null)
        .map((u) => normalizeEmail(u.email)),
    );

    let created = 0;
    let updated = 0;
    const skipped: string[] = [];

    const results = [];
    for (const invite of uniqueInvites) {
      if (memberEmails.has(invite.email)) {
        skipped.push(invite.email);
        continue;
      }

      const existingInvitation = await ctx.db
        .query("projectInvitations")
        .withIndex("by_project_and_email", (q) =>
          q.eq("projectId", args.projectId).eq("email", invite.email),
        )
        .first();

      if (!existingInvitation) {
        const token = createInvitationToken();
        await ctx.db.insert("projectInvitations", {
          projectId: args.projectId,
          email: invite.email,
          position: invite.position,
          role: invite.role,
          invitedBy: user._id,
          status: INVITATION_STATUS.PENDING,
          token,
          expiresAt,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`[INVITE] Inserted invitation for ${invite.email} with token ${token}`);
        results.push({ email: invite.email, token });
        created += 1;
        continue;
      }

      const token = createInvitationToken();
      await ctx.db.patch(existingInvitation._id, {
        role: invite.role,
        position: invite.position,
        invitedBy: user._id,
        status: INVITATION_STATUS.PENDING,
        token,
        expiresAt,
        updatedAt: now,
      });
      console.log(`[INVITE] Patched invitation for ${invite.email} with new token ${token}`);
      results.push({ email: invite.email, token });
      updated += 1;
    }

    console.log(`[INVITE DONE] Created: ${created}, Updated: ${updated}, Skipped: ${skipped.length}`);
    return {
      projectId: args.projectId as Id<"projects">,
      created,
      updated,
      skipped,
      totalRequested: uniqueInvites.length,
      expiresAt,
      invitations: results,
    };
  },
});

export const getProjectInvitations = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const membership = await getProjectMember(ctx, user._id, args.projectId);
    if (!membership) return [];

    if (!hasPermission(membership.role as Role, PERMISSIONS.MEMBER_INVITE)) {
      return [];
    }

    if (args.status && !isValidInvitationStatus(args.status)) {
      throw new Error(`Invalid invitation status: ${args.status}`);
    }

    const limit = Math.min(Math.max(Math.floor(args.limit ?? 100), 1), 200);

    const invitations = await ctx.db
      .query("projectInvitations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(limit);

    const now = Date.now();
    const filtered = invitations
      .map((invitation) => {
        if (
          invitation.status === INVITATION_STATUS.PENDING &&
          invitation.expiresAt <= now
        ) {
          return {
            ...invitation,
            status: INVITATION_STATUS.EXPIRED,
          };
        }
        return invitation;
      })
      .filter((invitation) =>
        args.status ? invitation.status === args.status : true,
      );

    return filtered;
  },
});

export const acceptInvitation = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const token = args.token.trim();

    if (!token) {
      throw new Error("Invitation token is required");
    }

    const invitation = await ctx.db
      .query("projectInvitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const project = await ctx.db.get(invitation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.isArchived) {
      throw new Error("Cannot join an archived project");
    }

    if (project.isCollaborative === false) {
      throw new Error("Collaboration is disabled for this project");
    }

    const now = Date.now();

    if (invitation.status === INVITATION_STATUS.REVOKED) {
      throw new Error("Invitation has been revoked");
    }

    if (invitation.status === INVITATION_STATUS.ACCEPTED) {
      return {
        invitationId: invitation._id,
        projectId: invitation.projectId,
        status: invitation.status,
      };
    }

    if (invitation.expiresAt <= now) {
      await ctx.db.patch(invitation._id, {
        status: INVITATION_STATUS.EXPIRED,
        updatedAt: now,
      });
      throw new Error("Invitation has expired");
    }

    if (normalizeEmail(invitation.email) !== normalizeEmail(user.email)) {
      throw new Error("This invitation is for another email address");
    }

    const existingMember = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", invitation.projectId).eq("userId", user._id),
      )
      .first();

    if (!existingMember) {
      await ctx.db.insert("projectMembers", {
        projectId: invitation.projectId,
        userId: user._id,
        role: invitation.role,
        position: invitation.position,
        joinedAt: now,
      });
    }

    await ctx.db.patch(invitation._id, {
      status: INVITATION_STATUS.ACCEPTED,
      acceptedBy: user._id,
      acceptedAt: now,
      updatedAt: now,
    });

    return {
      invitationId: invitation._id,
      projectId: invitation.projectId,
      status: INVITATION_STATUS.ACCEPTED,
    };
  },
});

export const remove = mutation({
  args: {
    id: v.id("projectInvitations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const invitation = await ctx.db.get(args.id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const membership = await getProjectMemberOrThrow(
      ctx,
      user._id,
      invitation.projectId,
    );
    requirePermission(membership.role as Role, PERMISSIONS.MEMBER_REMOVE);

    if (invitation.status === INVITATION_STATUS.ACCEPTED) {
      throw new Error("Accepted invitation cannot be revoked");
    }

    if (invitation.status === INVITATION_STATUS.REVOKED) {
      return {
        invitationId: invitation._id,
        projectId: invitation.projectId,
        status: invitation.status,
      };
    }

    const now = Date.now();
    await ctx.db.patch(invitation._id, {
      status: INVITATION_STATUS.REVOKED,
      updatedAt: now,
    });

    return {
      invitationId: invitation._id,
      projectId: invitation.projectId,
      status: INVITATION_STATUS.REVOKED,
    };
  },
});

export const verifyAndAcceptJoinByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const token = args.token.trim();

    if (!token) {
      throw new Error("Token is required");
    }

    const now = Date.now();

    const project = await ctx.db
      .query("projects")
      .withIndex("by_invite_token", (q) => q.eq("inviteToken", token))
      .first();

    if (project) {
      if (project.isArchived) {
        throw new Error("Cannot join an archived project");
      }

      if (project.isCollaborative === false) {
        throw new Error("Collaboration is disabled for this project");
      }

      const existingMember = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_and_user", (q) =>
          q.eq("projectId", project._id).eq("userId", user._id),
        )
        .first();

      if (existingMember) {
        return { projectId: project._id, status: "ALREADY_MEMBER" };
      }

      if (project.inviteMaxUses !== undefined && project.inviteMaxUses !== null) {
        const currentCount = project.inviteUseCount ?? 0;
        if (currentCount >= project.inviteMaxUses) {
          throw new Error("This invitation link has reached its usage limit.");
        }
      }

      await ctx.db.insert("projectMembers", {
        projectId: project._id,
        userId: user._id,
        role: project.defaultJoinRole ?? ROLES.FE,
        position: project.defaultJoinPosition ?? INVITATION_DEFAULT_POSITION.MEMBER,
        joinedAt: now,
      });

      if (project.inviteMaxUses !== undefined && project.inviteMaxUses !== null) {
        await ctx.db.patch(project._id, {
          inviteUseCount: (project.inviteUseCount ?? 0) + 1,
        });
      }

      return { projectId: project._id, status: "JOINED" };
    }

    const invitation = await ctx.db
      .query("projectInvitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) {
      throw new Error("Invalid or expired join token");
    }

    if (invitation.status === INVITATION_STATUS.REVOKED) {
      throw new Error("Invitation has been revoked");
    }

    if (invitation.expiresAt <= now) {
      await ctx.db.patch(invitation._id, {
        status: INVITATION_STATUS.EXPIRED,
        updatedAt: now,
      });
      throw new Error("Invitation has expired");
    }

    if (normalizeEmail(invitation.email) !== normalizeEmail(user.email)) {
      throw new Error("This invitation was sent to another email address");
    }

    const existingMember = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", invitation.projectId).eq("userId", user._id),
      )
      .first();

    if (!existingMember) {
      await ctx.db.insert("projectMembers", {
        projectId: invitation.projectId,
        userId: user._id,
        role: invitation.role,
        position: invitation.position,
        joinedAt: now,
      });
    }

    await ctx.db.patch(invitation._id, {
      status: INVITATION_STATUS.ACCEPTED,
      acceptedBy: user._id,
      acceptedAt: now,
      updatedAt: now,
    });

    return { projectId: invitation.projectId, status: "JOINED" };
  },
});

export const previewInvitationByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) return { error: "Token is required" };

    const now = Date.now();

    // Check project link first
    const project = await ctx.db
      .query("projects")
      .withIndex("by_invite_token", (q) => q.eq("inviteToken", token))
      .first();

    if (project) {
      if (project.isArchived) {
        return { error: "This project has been archived and is no longer accepting members." };
      }

      if (project.isCollaborative === false) {
        return { error: "Public collaboration is currently disabled for this project." };
      }

      if (project.inviteMaxUses !== undefined && project.inviteMaxUses !== null) {

        const currentCount = project.inviteUseCount ?? 0;
        if (currentCount >= project.inviteMaxUses) {
          return { error: "This invitation link has reached its usage limit." };
        }
      }
      
      const manager = await ctx.db.get(project.managerId);

      return {
        projectName: project.name,
        inviterName: manager?.fullName ?? "Unknown",
        type: "project_link"
      };
    }

    // Then check specific invitation
    const invitation = await ctx.db
      .query("projectInvitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) return { error: "Invalid or expired join token" };
    if (invitation.status === INVITATION_STATUS.REVOKED) return { error: "Invitation has been revoked" };
    if (invitation.expiresAt <= now) return { error: "Invitation has expired" };

    const invProject = await ctx.db.get(invitation.projectId);
    if (!invProject) return { error: "Project no longer exists" };

    if (invProject.isArchived) {
      return { error: "This project has been archived and is no longer accepting members." };
    }

    if (invProject.isCollaborative === false) {
      return { error: "Collaboration is currently disabled for this project." };
    }


    const inviter = await ctx.db.get(invitation.invitedBy);

    return {
      projectName: invProject.name,
      inviterName: inviter?.fullName ?? "Unknown",
      type: "email_invite"
    };
  },
});

export const checkEmailsExistence = query({
  args: {
    projectId: v.id("projects"),
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const membership = await getProjectMember(ctx, user._id, args.projectId);
    if (!membership) return [];

    const results = await Promise.all(
      args.emails.map(async (email) => {
        const normalized = normalizeEmail(email);

        // 1. Check if user is registered in the system
        const registeredUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalized))
          .first();

        if (!registeredUser) {
          return { email, isRegistered: false, isMember: false };
        }

        // 2. Check if user is already a member of the project
        const existingMember = await ctx.db
          .query("projectMembers")
          .withIndex("by_project_and_user", (q) =>
            q.eq("projectId", args.projectId).eq("userId", registeredUser._id),
          )
          .first();

        return {
          email,
          isRegistered: true,
          isMember: !!existingMember,
          user: {
            fullName: registeredUser.fullName,
            imageUrl: registeredUser.imageUrl,
          },
        };
      })
    );

    return results;
  },
});
