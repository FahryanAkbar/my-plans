import { 
  TASK_TYPE, 
  TASK_PRIORITY, 
  TASK_STATUS,
  TASK_TYPE_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS
} from "../task/task";

import type { 
  TaskPriority, 
  TaskStatus 
} from "../task/task";

export const TASK_LIST_GRID_TEMPLATE = 
  "grid-cols-[24px_32px_32px_280px_100px_minmax(0,1fr)_100px_160px_120px_100px]";

export const TASK_TYPE_COLORS = {
  FEATURE: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground",
  BUG: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-foreground",
  TASK: "bg-info/10 text-info dark:bg-info/20 dark:text-info-foreground",
  TESTING: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-foreground",
  DOCUMENTATION: "bg-tertiary/10 text-tertiary dark:bg-tertiary/20 dark:text-tertiary-foreground",
  RESEARCH: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground",
  PLANNING: "bg-success/10 text-success dark:bg-success/20 dark:text-success-foreground",
  MEETING: "bg-info/10 text-info dark:bg-info/20 dark:text-info-foreground",
  REVIEW: "bg-tertiary/10 text-tertiary dark:bg-tertiary/20 dark:text-tertiary-foreground",
  REFACTOR: "bg-neutral/10 text-neutral-foreground dark:bg-neutral/20 dark:text-neutral-foreground",
  DEPLOYMENT: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-foreground",
  MAPPING: "bg-neutral/10 text-neutral-foreground dark:bg-neutral/20 dark:text-neutral-foreground",
  OTHER: "bg-neutral/10 text-neutral-foreground dark:bg-neutral/20 dark:text-neutral-foreground"
} as const;

export const TASK_PRIORITY_COLORS = {
  URGENT: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-foreground",
  HIGH: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-foreground",
  MEDIUM: "bg-info/10 text-info dark:bg-info/20 dark:text-info-foreground",
  LOW: "bg-success/10 text-success dark:bg-success/20 dark:text-success-foreground",
} as const;

export const TASK_STATUS_COLORS = {
  TODO: "bg-neutral/10 text-neutral-foreground dark:bg-neutral/20 dark:text-neutral-foreground",
  IN_PROGRESS: "bg-info/10 text-info dark:bg-info/20 dark:text-info-foreground",
  BLOCKED: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-foreground",
  IN_REVIEW: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground",
  DONE: "bg-success/10 text-success dark:bg-success/20 dark:text-success-foreground",
} as const;

export const TASK_TYPE_CONFIGURATION = {
  FEATURE: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.FEATURE], 
    color: TASK_TYPE_COLORS.FEATURE 
  },
  BUG: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.BUG], 
    color: TASK_TYPE_COLORS.BUG 
  },
  TASK: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.TASK], 
    color: TASK_TYPE_COLORS.TASK 
  },
  TESTING: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.TESTING], 
    color: TASK_TYPE_COLORS.TESTING 
  },
  DOCUMENTATION: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.DOCUMENTATION], 
    color: TASK_TYPE_COLORS.DOCUMENTATION 
  },
  RESEARCH: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.RESEARCH], 
    color: TASK_TYPE_COLORS.RESEARCH 
  },
  PLANNING: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.PLANNING], 
    color: TASK_TYPE_COLORS.PLANNING 
  },
  MEETING: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.MEETING], 
    color: TASK_TYPE_COLORS.MEETING 
  },
  REVIEW: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.REVIEW], 
    color: TASK_TYPE_COLORS.REVIEW 
  },
  REFACTOR: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.REFACTOR], 
    color: TASK_TYPE_COLORS.REFACTOR 
  },
  DEPLOYMENT: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.DEPLOYMENT], 
    color: TASK_TYPE_COLORS.DEPLOYMENT 
  },
  MAPPING: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.MAPPING], 
    color: TASK_TYPE_COLORS.MAPPING 
  },
  OTHER: { 
    label: TASK_TYPE_LABELS[TASK_TYPE.OTHER], 
    color: TASK_TYPE_COLORS.OTHER 
  },
} as const;

export const TASK_PRIORITY_CONFIGURATION = {
  URGENT: { 
    label: TASK_PRIORITY_LABELS[TASK_PRIORITY.URGENT], 
    color: TASK_PRIORITY_COLORS.URGENT 
  },
  HIGH: { 
    label: TASK_PRIORITY_LABELS[TASK_PRIORITY.HIGH], 
    color: TASK_PRIORITY_COLORS.HIGH 
  },
  MEDIUM: { 
    label: TASK_PRIORITY_LABELS[TASK_PRIORITY.MEDIUM], 
    color: TASK_PRIORITY_COLORS.MEDIUM 
  },
  LOW: { 
    label: TASK_PRIORITY_LABELS[TASK_PRIORITY.LOW], 
    color: TASK_PRIORITY_COLORS.LOW 
  },
} as const;

export const TASK_STATUS_CONFIGURATION = {
  TODO: { 
    label: TASK_STATUS_LABELS[TASK_STATUS.TODO], 
    color: TASK_STATUS_COLORS.TODO 
  },
  IN_PROGRESS: { 
    label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS], 
    color: TASK_STATUS_COLORS.IN_PROGRESS 
  },
  BLOCKED: { 
    label: TASK_STATUS_LABELS[TASK_STATUS.BLOCKED], 
    color: TASK_STATUS_COLORS.BLOCKED 
  },
  IN_REVIEW: { 
    label: TASK_STATUS_LABELS[TASK_STATUS.IN_REVIEW], 
    color: TASK_STATUS_COLORS.IN_REVIEW 
  },
  DONE: { 
    label: TASK_STATUS_LABELS[TASK_STATUS.DONE], 
    color: TASK_STATUS_COLORS.DONE 
  },
} as const;

export const BOARD_STATUS_TASK = {
  [TASK_STATUS.TODO]: {
    id: TASK_STATUS.TODO,
    label: TASK_STATUS_LABELS[TASK_STATUS.TODO],
  },
  [TASK_STATUS.IN_PROGRESS]: {
    id: TASK_STATUS.IN_PROGRESS,
    label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS],
  },
    [TASK_STATUS.IN_REVIEW]: {
    id: TASK_STATUS.IN_REVIEW,
    label: TASK_STATUS_LABELS[TASK_STATUS.IN_REVIEW],
  },
  [TASK_STATUS.BLOCKED]: {
    id: TASK_STATUS.BLOCKED,
    label: TASK_STATUS_LABELS[TASK_STATUS.BLOCKED],
  },
  [TASK_STATUS.DONE]: {
    id: TASK_STATUS.DONE,
    label: TASK_STATUS_LABELS[TASK_STATUS.DONE],
  }
} as const;

export type TaskTypeColors = (typeof TASK_TYPE_COLORS)[keyof typeof TASK_TYPE_COLORS];
export type TaskTypeConfiguration = (typeof TASK_TYPE_CONFIGURATION)[keyof typeof TASK_TYPE_CONFIGURATION];

export type TaskPriorityColors = (typeof TASK_PRIORITY_COLORS)[keyof typeof TASK_PRIORITY_COLORS];
export type TaskPriorityConfiguration = (typeof TASK_PRIORITY_CONFIGURATION)[keyof typeof TASK_PRIORITY_CONFIGURATION];

export type TaskStatusColors = (typeof TASK_STATUS_COLORS)[keyof typeof TASK_STATUS_COLORS];
export type TaskStatusConfiguration = (typeof TASK_STATUS_CONFIGURATION)[keyof typeof TASK_STATUS_CONFIGURATION];

export const getPriorityVisualConfig = (priority?: TaskPriority) => {
  return TASK_PRIORITY_CONFIGURATION[priority as keyof typeof TASK_PRIORITY_CONFIGURATION]
};

export const getStatusVisualConfig = (status?: TaskStatus) => {
  return TASK_STATUS_CONFIGURATION[status as keyof typeof TASK_STATUS_CONFIGURATION]
};

export const getTypeVisualConfig = (type?: string) => {
  return TASK_TYPE_CONFIGURATION[type as keyof typeof TASK_TYPE_CONFIGURATION] || { color: "bg-muted/30", label: type };
};
