import { ProjectPlatform, InvitationPosition, Role } from "@/lib";

export interface InviteMemberPayload {
  email: string;
  position: InvitationPosition;
  role: Role;
}

export interface InviteMembersResult {
  projectId: string;
  created: number;
  updated: number;
  skipped: string[];
  totalRequested: number;
  expiresAt: number;
  invitations: { email: string; token: string }[];
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  startDate: number;
  endDate?: number;

  status: string;
  progress: number;
  platform?: string;
  icon?: string;

  projectImage?: string;
  isArchived: boolean;
  isCollaborative?: boolean;
  lastEditedBy?: string;

  key?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;

  startDate: number;
  endDate?: number;

  platform: ProjectPlatform;
  icon?: string;
  isCollaborative?: boolean;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;

  startDate?: number;
  endDate?: number;

  platform?: string;
  status?: string;

  icon?: string;
  isCollaborative?: boolean;
  projectImage?: string;
}