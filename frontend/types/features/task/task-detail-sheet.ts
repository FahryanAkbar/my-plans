import { Id } from "@/convex/_generated/dataModel";

export interface AssigneeDetail {
  fullName: string;
  imageUrl?: string;
}

export interface TaskWithDetails {
  _id: Id<"tasks">;
  _creationTime: number;
  projectId: Id<"projects">;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  scoreValue: number;
  assigneeId?: string;
  watchers: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: number;
  lastStatusChangedAt?: number;
  reporterId: Id<"users">;
  createdBy: string;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  assigneeDetails: AssigneeDetail[];
  watcherDetails: AssigneeDetail[];
  commentsCount: number;
}

export interface TaskDetailSheetProps {
  taskId: Id<"tasks"> | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: TaskWithDetails) => void;
}
