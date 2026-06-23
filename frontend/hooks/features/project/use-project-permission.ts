"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { ROLE_PERMISSIONS, Permission, Role, UserPosition } from "@/lib";

export const useProjectPermission = (projectId: Id<"projects">) => {
  const member = useQuery(api.project.getCurrentMember, { projectId });

  const isLoading = member === undefined;

  const can = (permission: Permission): boolean => {
    if (isLoading || !member) return false;
    
    const userRole = member.role as Role;
    const allowedPermissions = ROLE_PERMISSIONS[userRole] || [];
    
    return allowedPermissions.includes(permission);
  };

  const cannot = (permission: Permission): boolean => !can(permission);

  return {
    can,
    cannot,
    isLoading,
    role: member?.role as Role | undefined,
    position: member?.position as UserPosition | undefined,
    currentUserId: member?.userId,
  };
};

