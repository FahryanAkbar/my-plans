"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useIssues } from "./use-issues";
import { IssueView } from "@/components/organisms";

export const useIssueTemplate = (projectId: Id<"projects">) => {
  const issueHook = useIssues(projectId);
  const [activeView, setActiveView] = useState<IssueView>("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedFilters, setSelectedFilters] = useState<{
    status: string[];
    priority: string[];
    severity: string[];
    isCreatedByMe: boolean;
    isAssignedToMe: boolean;
  }>({
    status: [],
    priority: [],
    severity: [],
    isCreatedByMe: false,
    isAssignedToMe: false,
  });
  const [deletingIssueId, setDeletingIssueId] = useState<Id<"issues"> | null>(null);

  const project = useQuery(api.project.getProjectById, { projectId });
  const members = useQuery(api.project.getProjectMembers, { projectId });
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleDeleteConfirm = async () => {
    if (deletingIssueId) {
      await issueHook.onDeleteIssue(deletingIssueId);
      setDeletingIssueId(null);
    }
  };

  const onEditFromDetail = () => {
    const issue = issueHook.issues?.find(i => i._id === issueHook.detailIssueId);
    if (issue) {
      issueHook.onCloseDetail();
      issueHook.onEditIssue(issue);
    }
  };

  const filteredIssues = issueHook.issues?.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArchived = issueHook.showArchived || !issue.isArchived;

    const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(issue.status);
    const matchesPriority = selectedFilters.priority.length === 0 || (issue.priority && selectedFilters.priority.includes(issue.priority));
    const matchesSeverity = selectedFilters.severity.length === 0 || selectedFilters.severity.includes(issue.severity);
    const matchesCreatedByMe =
      !selectedFilters.isCreatedByMe || (currentUser ? issue.reporterId === currentUser._id : false);
    const matchesAssignedToMe =
      !selectedFilters.isAssignedToMe || (currentUser ? issue.assigneeId === currentUser._id : false);

    return (
      matchesSearch &&
      matchesArchived &&
      matchesStatus &&
      matchesPriority &&
      matchesSeverity &&
      matchesCreatedByMe &&
      matchesAssignedToMe
    );
  });

  return {
    ...issueHook,
    issues: filteredIssues,
    activeView,
    setActiveView,
    searchTerm,
    setSearchTerm,
    activitySearch,
    setActivitySearch,
    selectedActions,
    setSelectedActions,
    selectedMemberId,
    setSelectedMemberId,
    selectedPeriod,
    setSelectedPeriod,
    selectedFilters,
    setSelectedFilters,
    project,
    members,
    deletingIssueId,
    setDeletingIssueId,
    handleDeleteConfirm,
    onEditFromDetail,
    isLoading: issueHook.isLoading || project === undefined,
  };
};
