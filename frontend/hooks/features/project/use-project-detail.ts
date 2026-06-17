"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { type InviteMemberPayload, type UpdateProjectInput } from "@/types/features";

export const useProjectDetail = (projectId: Id<"projects">) => {
  const project = useQuery(api.project.getProjectById, { projectId });
  const members = useQuery(api.project.getProjectMembers, { projectId });
  const invitations = useQuery(api.invitation.getProjectInvitations, { projectId });
  const currentMember = useQuery(api.project.getCurrentMember, { projectId });
  const inviteMembers = useMutation(api.invitation.inviteMembers);
  const cancelInvitation = useMutation(api.invitation.remove);
  const removeMember = useMutation(api.project.removeMember);
  const updateMember = useMutation(api.project.updateMember);
  const update = useMutation(api.project.update);

  const onUpdate = async (values: UpdateProjectInput) => {
    return await update({ id: projectId, ...values });
  };

  const onInviteMembers = async (invites: InviteMemberPayload[]) => {
    return await inviteMembers({
      projectId,
      invites,
    });
  };

  const getMemberName = (userId?: string) => {
    if (!userId || !members) return "-";
    const member = members.find((m) => m.userId === userId);
    return member?.fullName ?? userId;
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${baseUrl}/join/${project?.inviteToken || projectId}`;

  return {
    project,
    members,
    invitations,
    currentMember,
    inviteLink,
    onInviteMembers,
    onCancelInvitation: (id: Id<"projectInvitations">) => cancelInvitation({ id }),
    onRemoveMember: (memberUserId: Id<"users">) => removeMember({ projectId, memberUserId }),
    onUpdateMember: (memberUserId: Id<"users">, updates: { role?: string, position?: string }) => 
      updateMember({ projectId, memberUserId, ...updates }),
    onUpdate,
    getMemberName,
    isLoading: project === undefined || members === undefined || invitations === undefined || currentMember === undefined,
  };
};
