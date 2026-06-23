"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { IssueStatus, IssueSeverity, IssuePriority } from "@/lib";

export interface CreateIssueValues {
  title: string;
  description?: string;
  severity: IssueSeverity;
  status: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  labels?: string[];
  attachments?: string[];
  linkedTaskId?: string | null;
}

export interface IssueWithDetails extends Doc<"issues"> {
  reporterDetails: { fullName: string; imageUrl?: string } | null;
  assigneeDetails: { fullName: string; imageUrl?: string } | null;
  linkedTaskDetails: Doc<"tasks"> | null;
}

export const useIssues = (projectId: Id<"projects">) => {
  const issues = useQuery(api.issues.getByProject, { projectId });
  const createIssue = useMutation(api.issues.create);
  const updateIssue = useMutation(api.issues.update);
  const deleteIssue = useMutation(api.issues.remove);
  const deleteBulkIssues = useMutation(api.issues.removeBulk);
  const updateBulkStatus = useMutation(api.issues.updateBulkStatus);
  const updateBulkArchive = useMutation(api.issues.updateBulkArchive);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<IssueStatus | undefined>(undefined);
  const [editingIssue, setEditingIssue] = useState<IssueWithDetails | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<Id<"issues"> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<Id<"issues">>>(new Set());

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailIssueId, setDetailIssueId] = useState<Id<"issues"> | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const onToggleArchived = () => setShowArchived(prev => !prev);

  const onOpenDetail = (id: Id<"issues">) => {
    setDetailIssueId(id);
    setIsDetailOpen(true);
  };

  const onCloseDetail = () => {
    setIsDetailOpen(false);
    setDetailIssueId(null);
  };

  const onSelect = (id: Id<"issues">, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const onSelectAll = (status: IssueStatus, checked: boolean) => {
    if (!issues) return;
    const columnIssues = issues.filter(i => i.status === status);
    
    setSelectedIds((prev) => {
      const next = new Set(prev);
      columnIssues.forEach(i => {
        if (checked) next.add(i._id);
        else next.delete(i._id);
      });
      return next;
    });
  };

  const onBulkDelete = async (status: IssueStatus) => {
    if (!issues) return;
    const idsToDelete = issues
      .filter(i => i.status === status && selectedIds.has(i._id))
      .map(i => i._id);

    if (idsToDelete.length === 0) return;

    try {
      await deleteBulkIssues({ ids: idsToDelete, projectId });
      toast.success(`${idsToDelete.length} issues deleted`);
      
      setSelectedIds((prev) => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
      });
    } catch (error) {
      toast.error("Failed to delete issues");
      console.error(error);
    }
  };

  const onOpenCreate = (status?: IssueStatus) => {
    setEditingIssue(null);
    setInitialStatus(status);
    setIsCreateOpen(true);
  };

  const onEditIssue = (issue: IssueWithDetails) => {
    setEditingIssue(issue);
    setIsCreateOpen(true);
  };

  const onCloseModal = () => {
    setIsCreateOpen(false);
    setEditingIssue(null);
  };

  const onCreateSubmit = async (values: CreateIssueValues) => {
    try {
      const { linkedTaskId, ...rest } = values;

      if (editingIssue) {
        const updatePayload = {
          ...rest,
          ...(linkedTaskId !== undefined
            ? { linkedTaskId: linkedTaskId === null ? null : (linkedTaskId as Id<"tasks">) }
            : {}),
        };

        await updateIssue({
          id: editingIssue._id,
          ...updatePayload,
        });
      } else {
        const createPayload = {
          ...rest,
          ...(linkedTaskId ? { linkedTaskId: linkedTaskId as Id<"tasks"> } : {}),
        };

        await createIssue({
          ...createPayload,
          projectId,
        });
      }
      onCloseModal();
    } catch (error) {
      toast.error("Failed to save issue");
      console.error(error);
    }
  };

  const onStatusChange = async (issueId: Id<"issues">, status: IssueStatus) => {
    try {
      await updateIssue({
        id: issueId,
        status,
      });
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const onUpdateIssue = async (id: Id<"issues">, updates: Partial<CreateIssueValues>) => {
    try {
      // Preserve explicit null so linked task can be unlinked.
      const { linkedTaskId, ...rest } = updates;
      
      await updateIssue({
        id,
        ...rest,
        ...(linkedTaskId !== undefined
          ? { linkedTaskId: linkedTaskId === null ? null : (linkedTaskId as Id<"tasks">) }
          : {}),
      });
      toast.success("Issue updated");
    } catch (error) {
      toast.error("Failed to update issue");
      console.error(error);
    }
  };

  const onBulkStatusUpdate = async (status: IssueStatus) => {
    const idsToUpdate = Array.from(selectedIds);
    if (idsToUpdate.length === 0) return;

    try {
      await updateBulkStatus({ ids: idsToUpdate, projectId, status });
      toast.success(`${idsToUpdate.length} issues updated to ${status}`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to update issues");
      console.error(error);
    }
  };

  const onBulkArchive = async (isArchived: boolean) => {
    const idsToUpdate = Array.from(selectedIds);
    if (idsToUpdate.length === 0) return;

    try {
      await updateBulkArchive({ ids: idsToUpdate, projectId, isArchived });
      toast.success(`${idsToUpdate.length} issues ${isArchived ? "archived" : "unarchived"}`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error(`Failed to ${isArchived ? "archive" : "unarchive"} issues`);
      console.error(error);
    }
  };

  const onDeleteIssue = async (issueId: Id<"issues">) => {
    try {
      await deleteIssue({ id: issueId });
      toast.success("Issue deleted");
    } catch (error) {
      toast.error("Failed to delete issue");
      console.error(error);
    }
  };

  return {
    issues,
    isLoading: issues === undefined,
    isCreateOpen,
    initialStatus,
    setIsCreateOpen,
    editingIssue,
    selectedIssueId,
    selectedIds,
    isDetailOpen,
    detailIssueId,
    onOpenDetail,
    onCloseDetail,
    onSelect,
    onSelectAll,
    onBulkDelete,
    onOpenCreate,
    onEditIssue,
    onCloseModal,
    onCreateSubmit,
    onStatusChange,
    onUpdateIssue,
    onDeleteIssue,
    onBulkStatusUpdate,
    onBulkArchive,
    setSelectedIssueId,
    setSelectedIds,
    setIsDetailOpen,
    showArchived,
    onToggleArchived,
  };
};
