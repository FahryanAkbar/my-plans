export const STATUS_LABELS = {
  DONE: "Done",
  IN_REVIEW: "In Review",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  TODO: "To Do",
  OVERDUE: "Overdue",
} as const

export const STATUS_COLORS = {
  DONE: "#10b981",
  IN_REVIEW: "#8b5cf6",
  IN_PROGRESS: "#3b82f6",
  BLOCKED: "#ef4444",
  TODO: "#64748b",
  OVERDUE: "#f43f5e",
} as const

export const TREND_CHART_DIRECTION = {
  NEUTRAL: 'neutral',
  UP: "up",
  DOWN: 'down',
} as const

export const STATUS_CONFIGURATION = {
  DONE: { 
    label: STATUS_LABELS.DONE, 
    color: STATUS_COLORS.DONE
  },
  IN_REVIEW: { 
    label: STATUS_LABELS.IN_REVIEW, 
    color: STATUS_COLORS.IN_REVIEW
  },
  IN_PROGRESS: { 
    label: STATUS_LABELS.IN_PROGRESS, 
    color: STATUS_COLORS.IN_PROGRESS
  },
  BLOCKED: { 
    label: STATUS_LABELS.BLOCKED, 
    color: STATUS_COLORS.BLOCKED
  },
  TODO: { 
    label: STATUS_LABELS.TODO, 
    color: STATUS_COLORS.TODO
  },
  OVERDUE: { 
    label: STATUS_LABELS.OVERDUE, 
    color: STATUS_COLORS.OVERDUE
  },
}

export type StatusLabels =
  (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS]

export type StatusColors =
  (typeof STATUS_COLORS)[keyof typeof STATUS_COLORS]

export type StatusConfiguration =
  (typeof STATUS_CONFIGURATION)[keyof typeof STATUS_CONFIGURATION]

export type TrendChartDirection = 
  (typeof TREND_CHART_DIRECTION)[keyof typeof TREND_CHART_DIRECTION]