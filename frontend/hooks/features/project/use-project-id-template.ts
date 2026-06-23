"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatFlag, formatStatus, ROLES, USER_POSITION } from "@/lib";
import { useSidebar, useBreadcrumbs } from "@/hooks/common";
import { useProjectDetail } from "./use-project-detail";
import type { ProjectTab } from "@/components/organisms";

export const useProjectIdTemplate = (projectId: Id<"projects">) => {
  const {
    sidebarRef,
    navbarRef,
    isMobile,
    isResetting,
    isCollapsed,
    handleMouseDown,
    handleCreate,
    resetWidth,
    collapse,
  } = useSidebar();
  const breadcrumbs = useBreadcrumbs();
  const [activeTab, setActiveTab] = React.useState<ProjectTab>("overview");
  
  const router = useRouter();
  const leave = useMutation(api.project.leave);

  const projectDetail = useProjectDetail(projectId);
  const {
    project,
    members,
    invitations,
    currentMember,
    inviteLink,
    onInviteMembers,
    onCancelInvitation,
    onRemoveMember,
    onUpdateMember,
    onUpdate,
    getMemberName,
    isLoading,
  } = projectDetail;

  const canManageMembers = !!currentMember && (
    currentMember.role === ROLES.PIC ||
    currentMember.position === USER_POSITION.ADMIN
  );

  const canLeaveProject = !!currentMember &&
    currentMember.role !== ROLES.PIC &&
    currentMember.position !== USER_POSITION.ADMIN;

  const handleLeaveProject = React.useCallback(async () => {
    if (!project) return;
    try {
      await leave({ projectId: project._id });
      toast.success("You left the project");
      router.replace("/project");
    } catch {
      toast.error("Failed to leave project");
    }
  }, [leave, project, router]);

  React.useEffect(() => {
    if (!isLoading && !project) {
      const timer = setTimeout(() => {
        router.replace("/project");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, project, router]);

  const pendingInvitesCount = React.useMemo(
    () => invitations?.filter((i) => i.status.toLowerCase() === "pending").length || 0,
    [invitations]
  );

  const handleRemoveMember = React.useCallback(async (memberUserId: string) => {
    try {
      await onRemoveMember(memberUserId as Id<"users">);
      toast.success("Member removed from project");
    } catch {
      toast.error("Failed to remove member");
    }
  }, [onRemoveMember]);

  const handleUpdateMember = React.useCallback(async (memberUserId: string, updates: { role?: string, position?: string }) => {
    try {
      await onUpdateMember(memberUserId as Id<"users">, updates);
      toast.success("Member updated successfully");
    } catch {
      toast.error("Failed to update member");
    }
  }, [onUpdateMember]);

  const handleIconChange = React.useCallback(async (icon: string) => {
    try {
      await onUpdate({ icon });
    } catch {
      toast.error("Failed to update icon");
    }
  }, [onUpdate]);

  const handleRemoveIcon = React.useCallback(async () => {
    try {
      await onUpdate({ icon: "" });
    } catch {
      toast.error("Failed to remove icon");
    }
  }, [onUpdate]);

  const quickStats = React.useMemo(() => {
    if (!project || !members) return [];
    
    const taskCount = `${project.completedTasks || 0}/${project.totalTasks || 0} tasks`;

    return [
      { label: "Completion", value: `${project.progress}%`, subValue: taskCount },
      { label: "Team", value: members.length, subValue: "Members" },
      { label: "Platform", value: project.platform || "Web", subValue: "Public" },
      { label: "Status", value: project.status, subValue: !project.isArchived ? "Not Archived" : undefined },
    ];
  }, [project, members]);

  const projectIdentityFields = React.useMemo(() => {
    if (!project) return [];
    return [
      { label: "Name", value: project.name },
      { label: "Project Key", value: project.key ?? "-" },
      { label: "Manager", value: getMemberName(project.managerId) },
      { label: "Platform", value: project.platform ?? "-" },
      { label: "Description", value: project.description ?? "-" },
      { label: "Cover Image", value: project.projectImage ? "Available" : "Not Set" },
      { label: "Visibility", value: project.isCollaborative ? "Public" : "Private" },
    ];
  }, [project, getMemberName]);

  const projectTimelineFields = React.useMemo(() => {
    if (!project) return [];
    return [
      { label: "Start Date", value: formatDate(project.startDate) },
      { label: "End Date", value: formatDate(project.endDate) },
      { label: "Created", value: formatDate(project.createdAt) },
      { label: "Last Updated", value: formatDate(project.updatedAt) },
      { label: "Status", value: formatStatus(project.status) },
      { label: "Progress", value: `${project.progress}%` },
      { label: "Collaborative", value: formatFlag(project.isCollaborative) },
      { label: "Archived", value: formatFlag(project.isArchived) },
      { label: "Last Edited By", value: getMemberName(project.lastEditedBy) },
    ];
  }, [project, getMemberName]);

  return {
    sidebarRef,
    navbarRef,
    isMobile,
    isResetting,
    isCollapsed,
    handleMouseDown,
    handleCreate,
    resetWidth,
    collapse,
    breadcrumbs,
    activeTab,
    setActiveTab,
    project,
    members,
    invitations,
    currentMember,
    inviteLink,
    onInviteMembers,
    onCancelInvitation,
    onUpdate,
    handleRemoveMember,
    handleUpdateMember,
    handleIconChange,
    handleRemoveIcon,
    getMemberName,
    isLoading,
    canManageMembers,
    canLeaveProject,
    handleLeaveProject,
    pendingInvitesCount,
    quickStats,
    projectIdentityFields,
    projectTimelineFields,
  };
};
