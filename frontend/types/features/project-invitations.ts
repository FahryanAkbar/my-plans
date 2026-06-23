import { InvitationStatus, Role, InvitationPosition } from "@/lib";

export interface ProjectInvitation {
  id: string;
  projectId: string;

  email: string;
  position: InvitationPosition;
  role: Role;
  invitedBy: string;

  status: InvitationStatus;
  token: string;
  expiresAt: number;
  acceptedBy?: string;
  acceptedAt?: number;

  createdAt: number;
  updatedAt: number;
}

export interface ProjectInvitationInput {
  email: string;
  position: InvitationPosition;
  role: Role;
}

export interface InviteMembersInput {
  projectId: string;
  invites: ProjectInvitationInput[];
  expiresInDays?: number;
}

export interface ListProjectInvitationsInput {
  projectId: string;
  status?: InvitationStatus;
  limit?: number;
}

export type ProjectInvitations = ProjectInvitation;

