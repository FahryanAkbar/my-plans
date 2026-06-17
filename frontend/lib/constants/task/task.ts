import { 
  PlusCircle, 
  CircleDot, 
  Tag, 
  MessageSquare, 
  History 
} from "lucide-react";

export const TASK_TYPE = {
  FEATURE: "FEATURE",
  BUG: "BUG",
  TASK: "TASK",
  TESTING: "TESTING",
  DOCUMENTATION: "DOCUMENTATION",
  RESEARCH: "RESEARCH",
  PLANNING: "PLANNING",
  MEETING: "MEETING",
  REVIEW: "REVIEW",
  REFACTOR: "REFACTOR",
  DEPLOYMENT: "DEPLOYMENT",
  MAPPING: "MAPPING",
  OTHER: "OTHER",
} as const

export const TASK_TYPE_LABELS = {
  [TASK_TYPE.FEATURE]: "Feature",
  [TASK_TYPE.BUG]: "Bug",
  [TASK_TYPE.TASK]: "Task",
  [TASK_TYPE.TESTING]: "Testing",
  [TASK_TYPE.DOCUMENTATION]: "Documentation",
  [TASK_TYPE.RESEARCH]: "Research",
  [TASK_TYPE.PLANNING]: "Planning",
  [TASK_TYPE.MEETING]: "Meeting",
  [TASK_TYPE.REVIEW]: "Review",
  [TASK_TYPE.REFACTOR]: "Refactor",
  [TASK_TYPE.DEPLOYMENT]: "Deployment",
  [TASK_TYPE.MAPPING]: "Mapping",
  [TASK_TYPE.OTHER]: "Other",
} as const;

export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  BLOCKED: "BLOCKED",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: "To-Do",
  [TASK_STATUS.IN_PROGRESS]: "In-Progress",
  [TASK_STATUS.BLOCKED]: "Blocked",
  [TASK_STATUS.IN_REVIEW]: "In-Review",
  [TASK_STATUS.DONE]: "Complete",
} as const;

export const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: "Low",
  [TASK_PRIORITY.MEDIUM]: "Medium",
  [TASK_PRIORITY.HIGH]: "High",
  [TASK_PRIORITY.URGENT]: "Urgent",
} as const;

export const TASK_ESTIMATION_SIZES = [
  { label: "XS", value: 0.5, description: "< 1hr (Quick)" },
  { label: "S", value: 2, description: "1-3hrs (Small)" },
  { label: "M", value: 6, description: "4-8hrs (Medium)" },
  { label: "L", value: 16, description: "2-3 days (Large)" },
  { label: "XL", value: 40, description: "1 week+ (Extra Large)" },
] as const;

export const TASK_TIME_PRESETS = [
  { label: "+15m", value: 0.25 },
  { label: "+1h", value: 1 },
  { label: "+4h", value: 4 },
  { label: "1d", value: 8 },
] as const;


export const TASK_ACTIVITY_ACTION = {
  CREATED: "CREATED",
  STATUS_CHANGE: "STATUS_CHANGE",
  PRIORITY_CHANGE: "PRIORITY_CHANGE",
  ASSIGNEE_CHANGE: "ASSIGNEE_CHANGE",
  COMMENT_ADDED: "COMMENT_ADDED",
  TITLE_CHANGE: "TITLE_CHANGE",
  DESCRIPTION_CHANGE: "DESCRIPTION_CHANGE",
  DUE_DATE_CHANGE: "DUE_DATE_CHANGE",
} as const;

export const TASK_ACTIVITY_CONFIG = {
  [TASK_ACTIVITY_ACTION.CREATED]: {
    icon: PlusCircle,
    color: "bg-emerald-500/10 text-emerald-500",
    label: "Tugas dibuat"
  },
  [TASK_ACTIVITY_ACTION.STATUS_CHANGE]: {
    icon: CircleDot,
    color: "bg-blue-500/10 text-blue-500",
    label: "Mengubah status"
  },
  [TASK_ACTIVITY_ACTION.PRIORITY_CHANGE]: {
    icon: Tag,
    color: "bg-amber-500/10 text-amber-500",
    label: "Mengubah prioritas"
  },
  [TASK_ACTIVITY_ACTION.COMMENT_ADDED]: {
    icon: MessageSquare,
    color: "bg-purple-500/10 text-purple-500",
    label: "Menambahkan komentar"
  },
  DEFAULT: {
    icon: History,
    color: "bg-zinc-500/10 text-zinc-500",
    label: "Memperbarui tugas"
  }
} as const;

export type TaskType = 
  (typeof TASK_TYPE)[keyof typeof TASK_TYPE]

export type TaskStatus = 
  (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

export type TaskPriority = 
  (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]
