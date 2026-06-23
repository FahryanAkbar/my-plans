import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  MessageSquare
} from "lucide-react";

export const ISSUE_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export const ISSUE_PRIORITY = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
} as const;

export const ISSUE_SEVERITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export const ISSUE_LABELS = {
  BUG: "BUG",
  UI: "UI",
  UX: "UX",
  PERFORMANCE: "PERFORMANCE",
  SECURITY: "SECURITY",
  BACKEND: "BACKEND",
  FRONTEND: "FRONTEND",
} as const;

export const ISSUE_STATUS_LABELS = {
  [ISSUE_STATUS.OPEN]: "Open",
  [ISSUE_STATUS.IN_PROGRESS]: "In Progress",
  [ISSUE_STATUS.RESOLVED]: "Resolved",
  [ISSUE_STATUS.CLOSED]: "Closed",
} as const;

export const ISSUE_STATUS_CONFIG = {
  [ISSUE_STATUS.OPEN]: { 
    color: "bg-blue-500", 
    textColor: "text-blue-500",
    icon: AlertCircle,
    label: "Open"
  },
  [ISSUE_STATUS.IN_PROGRESS]: { 
    color: "bg-amber-500", 
    textColor: "text-amber-500",
    icon: Clock,
    label: "In Progress"
  },
  [ISSUE_STATUS.RESOLVED]: { 
    color: "bg-green-500", 
    textColor: "text-green-500",
    icon: CheckCircle2,
    label: "Resolved"
  },
  [ISSUE_STATUS.CLOSED]: { 
    color: "bg-zinc-500", 
    textColor: "text-zinc-500",
    icon: XCircle,
    label: "Closed"
  },
} as const;

export const ISSUE_SEVERITY_LABELS = {
  [ISSUE_SEVERITY.LOW]: "Low",
  [ISSUE_SEVERITY.MEDIUM]: "Medium",
  [ISSUE_SEVERITY.HIGH]: "High",
  [ISSUE_SEVERITY.CRITICAL]: "Critical",
} as const;

export const ISSUE_SEVERITY_CONFIG = {
  [ISSUE_SEVERITY.CRITICAL]: {
    style: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "Critical"
  },
  [ISSUE_SEVERITY.HIGH]: {
    style: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    label: "High"
  },
  [ISSUE_SEVERITY.MEDIUM]: {
    style: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    label: "Medium"
  },
  [ISSUE_SEVERITY.LOW]: {
    style: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    label: "Low"
  },
} as const;

export const ISSUE_PRIORITY_LABELS = {
  [ISSUE_PRIORITY.P0]: "P0 - Emergency (Must fix immediately)",
  [ISSUE_PRIORITY.P1]: "P1 - High (Major feature broken)",
  [ISSUE_PRIORITY.P2]: "P2 - Normal (Minor bug or improvement)",
  [ISSUE_PRIORITY.P3]: "P3 - Low (Cosmetic or trivial)",
} as const;

export const ISSUE_PRIORITY_CONFIG = {
  [ISSUE_PRIORITY.P0]: {
    icon: ChevronsUp,
    color: "text-red-500",
    label: "P0"
  },
  [ISSUE_PRIORITY.P1]: {
    icon: ChevronUp,
    color: "text-orange-500",
    label: "P1"
  },
  [ISSUE_PRIORITY.P2]: {
    icon: ChevronDown,
    color: "text-blue-500",
    label: "P2"
  },
  [ISSUE_PRIORITY.P3]: {
    icon: null,
    color: "text-zinc-500",
    label: "P3"
  },
} as const;

export const BOARD_STATUS_ISSUE = {
  [ISSUE_STATUS.OPEN]: { id: ISSUE_STATUS.OPEN, label: "Open", color: "bg-blue-500" },
  [ISSUE_STATUS.IN_PROGRESS]: { id: ISSUE_STATUS.IN_PROGRESS, label: "In Progress", color: "bg-amber-500" },
  [ISSUE_STATUS.RESOLVED]: { id: ISSUE_STATUS.RESOLVED, label: "Resolved", color: "bg-green-500" },
  [ISSUE_STATUS.CLOSED]: { id: ISSUE_STATUS.CLOSED, label: "Closed", color: "bg-zinc-500" },
} as const;

export const ISSUE_ACTIVITY_ACTION = {
  CREATED: "CREATED",
  STATUS_CHANGE: "STATUS_CHANGE",
  PRIORITY_CHANGE: "PRIORITY_CHANGE",
  SEVERITY_CHANGE: "SEVERITY_CHANGE",
  ASSIGNEE_CHANGE: "ASSIGNEE_CHANGE",
  COMMENT_ADDED: "COMMENT_ADDED",
  TITLE_CHANGE: "TITLE_CHANGE",
  DESCRIPTION_CHANGE: "DESCRIPTION_CHANGE",
} as const;

export const ISSUE_ACTIVITY_CONFIG = {
  [ISSUE_ACTIVITY_ACTION.CREATED]: {
    icon: AlertCircle,
    color: "bg-emerald-500/10 text-emerald-500",
    label: "Reported new issue"
  },
  [ISSUE_ACTIVITY_ACTION.STATUS_CHANGE]: {
    icon: CheckCircle2,
    color: "bg-blue-500/10 text-blue-500",
    label: "Changed issue status"
  },
  [ISSUE_ACTIVITY_ACTION.COMMENT_ADDED]: {
    icon: MessageSquare,
    color: "bg-purple-500/10 text-purple-500",
    label: "Added a comment"
  },
  DEFAULT: {
    icon: History,
    color: "bg-zinc-500/10 text-zinc-500",
    label: "Updated issue"
  }
} as const;

export const ISSUE_ACTIVITY_ACTION_FILTERS = [
  { id: "created", label: "Reported" },
  { id: "updated", label: "Status change" },
  { id: "comment_added", label: "Comment" },
] as const;

export const ISSUE_ACTIVITY_PERIOD_FILTERS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
] as const;

export type IssueStatus = (typeof ISSUE_STATUS)[keyof typeof ISSUE_STATUS];
export type IssueSeverity = (typeof ISSUE_SEVERITY)[keyof typeof ISSUE_SEVERITY];
export type IssuePriority = (typeof ISSUE_PRIORITY)[keyof typeof ISSUE_PRIORITY];
export type IssueLabel = (typeof ISSUE_LABELS)[keyof typeof ISSUE_LABELS];
