"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTableManagement } from "@/hooks";
import { TaskCardProps, TaskView } from "@/components/organisms";
import { TaskStatus, TaskPriority, TaskType, CreateTaskFormValues } from "@/lib";
import { toast } from "sonner";
import { format } from "date-fns";

export interface TaskFilters {
  status: TaskStatus[];
  priority: TaskPriority[];
  type: TaskType[];
  isCreatedByMe?: boolean;
  isAssignedToMe?: boolean;
}

export const useTaskProject = (projectId: Id<"projects">) => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<TaskView>("board");

  const dbTasks = useQuery(api.task.getByProject, { projectId });
  const updateTaskMutation = useMutation(api.task.update);
  const createTaskMutation = useMutation(api.task.create);
  const deleteTaskMutation = useMutation(api.task.remove);
  const archiveTaskMutation = useMutation(api.task.archive);
  const unarchiveTaskMutation = useMutation(api.task.unarchive);
  
  const members = useQuery(api.project.getProjectMembers, { projectId });
  const project = useQuery(api.project.getProjectById, { projectId });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCardProps | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus | undefined>();
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    type: [],
    isCreatedByMe: false,
    isAssignedToMe: false,
  });

  const filteredTasks = useMemo(() => {
    return (dbTasks || [])
      .filter((task) => showArchived ? true : !task.isArchived)
      .filter((task) => filters.status.length === 0 || filters.status.includes(task.status as TaskStatus))
      .filter((task) => filters.priority.length === 0 || filters.priority.includes(task.priority as TaskPriority))
      .filter((task) => filters.type.length === 0 || filters.type.includes(task.type as TaskType))
      .filter((task) => {
        if (!filters.isCreatedByMe && !filters.isAssignedToMe) return true;
        
        const matchesCreated = filters.isCreatedByMe && task.reporterId === currentUser?._id;
        const matchesAssigned = filters.isAssignedToMe && task.assigneeId === currentUser?._id;
        
        return matchesCreated || matchesAssigned;
      })
      .map((task) => ({
        ...task,
        index: 0,
      })) as unknown as TaskCardProps[];
  }, [dbTasks, showArchived, filters, currentUser?._id]);

  const table = useTableManagement<TaskCardProps>({
    initialData: filteredTasks,
    searchFields: ["title", "description", "status", "type", "priority"],
    defaultSort: { key: "createdAt", direction: "desc" },
    defaultPageSize: 1000,
  });

  const onTaskPatch = async (taskId: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => {
    try {
      await updateTaskMutation({
        id: taskId,
        ...updates,
      });
      toast.success("Task updated");
    } catch (error) {
      toast.error("Failed to update task");
      console.error("Failed to update task:", error);
    }
  };

  const onTaskUpdate = async (
    taskId: Id<"tasks">, 
    newStatus: TaskStatus, 
    newIndex: number,
    startDate?: number,
    dueDate?: number
  ) => {
    try {
      await updateTaskMutation({ 
        id: taskId, 
        status: newStatus, 
        index: newIndex,
        startDate,
        dueDate
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const onFormSubmit = async (values: CreateTaskFormValues) => {
    try {
      if (editingTask) {
        await updateTaskMutation({
          id: editingTask._id,
          ...values,
        });
      } else {
        await createTaskMutation({
          ...values,
          projectId,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const onAddTask = (status?: TaskStatus) => {
    setDefaultStatus(status);
    setEditingTask(null);
    setIsCreateOpen(true);
  };

  const onEdit = (task: TaskCardProps) => {
    setEditingTask(task);
    setIsCreateOpen(true);
  };

  const onDelete = async (task: TaskCardProps) => {
    try {
      await deleteTaskMutation({ id: task._id });
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Failed to delete task:", error);
    }
  };
  
  const onArchive = async (task: TaskCardProps) => {
    try {
      await archiveTaskMutation({ id: task._id });
      toast.success("Task archived successfully");
    } catch (error) {
      toast.error("Failed to archive task");
      console.error("Failed to archive task:", error);
    }
  };

  const onUnarchive = async (task: TaskCardProps) => {
    try {
      await unarchiveTaskMutation({ id: task._id });
      toast.success("Task unarchived successfully");
    } catch (error) {
      toast.error("Failed to unarchive task");
      console.error("Failed to unarchive task:", error);
    }
  };

  const onBulkDelete = async (taskIds: Id<"tasks">[]) => {
    try {
      await Promise.all(taskIds.map(id => deleteTaskMutation({ id })));
      toast.success(`${taskIds.length} tasks deleted`);
    } catch (error) {
      toast.error("Failed to delete some tasks");
      console.error("Failed to delete some tasks:", error);
    }
  };

  const onBulkArchive = async (taskIds: Id<"tasks">[]) => {
    try {
      await Promise.all(taskIds.map(id => archiveTaskMutation({ id })));
      toast.success(`${taskIds.length} tasks archived`);
    } catch (error) {
      toast.error("Failed to archive some tasks");
      console.error("Failed to archive some tasks:", error);
    }
  };

  const onBulkUnarchive = async (taskIds: Id<"tasks">[]) => {
    try {
      await Promise.all(taskIds.map(id => unarchiveTaskMutation({ id })));
      toast.success(`${taskIds.length} tasks unarchived`);
    } catch (error) {
      toast.error("Failed to unarchive some tasks");
      console.error("Failed to unarchive some tasks:", error);
    }
  };

  const onBulkMove = async (taskIds: Id<"tasks">[], newStatus: TaskStatus) => {
    try {
      await Promise.all(taskIds.map((id, index) => updateTaskMutation({ id, status: newStatus, index })));
      toast.success(`${taskIds.length} tasks moved to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      toast.error("Failed to move some tasks");
      console.error("Failed to move some tasks:", error);
    }
  };

  const [selectedIds, setSelectedIds] = useState<Set<Id<"tasks">>>(new Set());

  const toggleSelect = (id: Id<"tasks">, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectAllInGroup = (status: TaskStatus, checked: boolean) => {
    const groupTasks = table.data.filter(t => t.status === status);
    const newSelected = new Set(selectedIds);
    groupTasks.forEach(task => {
      if (checked) {
        newSelected.add(task._id);
      } else {
        newSelected.delete(task._id);
      }
    });
    setSelectedIds(newSelected);
  };

  const onSelectTask = (taskId: Id<"tasks">) => {
    setSelectedTaskId(taskId);
  };

  const onCloseDetail = () => {
    setSelectedTaskId(null);
  };

  const handleClose = () => {
    setIsCreateOpen(false);
    setEditingTask(null);
    setDefaultStatus(undefined);
  };

  return {
    tasks: table.data,
    project,
    isLoading: dbTasks === undefined || project === undefined,
    activeView,
    setActiveView,
    searchTerm: table.searchTerm,
    setSearchTerm: table.setSearchTerm,
    isCreateOpen,
    setIsCreateOpen: handleClose,
    editingTask,
    defaultStatus,
    onTaskUpdate,
    onFormSubmit,
    onAddTask,
    onEdit,
    onDelete,
    onArchive,
    onUnarchive,
    onBulkDelete,
    onBulkArchive,
    onBulkUnarchive,
    onBulkMove,
    onTaskPatch,
    members,
    totalTasks: table.totalItems,
    selectedTaskId,
    onSelectTask,
    onCloseDetail,
    showArchived,
    setShowArchived,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    clearSelection,
    selectAllInGroup,

    onAddDailyLog: (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      router.push(`/project/${projectId}/daily-logs/${dateStr}`);
    },
    onViewDailyLog: (date: number) => {
      const dateStr = format(new Date(date), "yyyy-MM-dd");
      router.push(`/project/${projectId}/daily-logs/${dateStr}`);
    },
  };
};
