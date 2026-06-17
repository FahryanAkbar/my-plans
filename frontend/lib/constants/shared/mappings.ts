import { 
  Circle, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Layout, 
  Zap, 
  Bug, 
  Square, 
  Shield, 
  Search, 
  FileText, 
  Users, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Minus,
  Ban,
  ArrowUpCircle,
  HelpCircle
} from "lucide-react";
import { PROJECT_STATUS, ProjectStatus } from "../project/project";
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE, TaskStatus, TaskPriority, TaskType } from "../task/task";


export const PROJECT_STATUS_MAPPING = {
  [PROJECT_STATUS.PLANNING]: {
    label: "Planning",
    variant: "secondary",
    color: "text-neutral-700 dark:text-neutral-300",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    icon: Layout,
  },
  [PROJECT_STATUS.ONGOING]: {
    label: "In Track",
    variant: "warning",
    color: "text-warning dark:text-warning",
    bgColor: "bg-warning/10 dark:bg-warning/20",
    icon: Clock,
  },
  [PROJECT_STATUS.AT_RISK]: {
    label: "At Risk",
    variant: "destructive",
    color: "text-secondary dark:text-secondary",
    bgColor: "bg-secondary/10 dark:bg-secondary/20",
    icon: AlertTriangle,
  },
  [PROJECT_STATUS.LATED]: {
    label: "Late",
    variant: "destructive",
    color: "text-danger dark:text-danger",
    bgColor: "bg-danger/10 dark:bg-danger/20",
    icon: AlertCircle,
  },
  [PROJECT_STATUS.COMPLETED]: {
    label: "Completed",
    variant: "success",
    color: "text-success dark:text-success",
    bgColor: "bg-success/10 dark:bg-success/20",
    icon: CheckCircle2,
  },
} as const;

export const TASK_STATUS_MAPPING = {
  [TASK_STATUS.TODO]: {
    label: "To-Do",
    color: "text-neutral-500",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    icon: Circle,
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    color: "text-info",
    bgColor: "bg-info/10 dark:bg-info/20",
    icon: Clock,
  },
  [TASK_STATUS.BLOCKED]: {
    label: "Blocked",
    color: "text-danger",
    bgColor: "bg-danger/10 dark:bg-danger/20",
    icon: Ban,
  },
  [TASK_STATUS.IN_REVIEW]: {
    label: "In Review",
    color: "text-secondary",
    bgColor: "bg-secondary/10 dark:bg-secondary/20",
    icon: Eye,
  },
  [TASK_STATUS.DONE]: {
    label: "Done",
    color: "text-success",
    bgColor: "bg-success/10 dark:bg-success/20",
    icon: CheckCircle2,
  },
} as const;

export const TASK_PRIORITY_MAPPING = {
  [TASK_PRIORITY.LOW]: {
    label: "Low",
    color: "text-neutral-400",
    icon: ChevronDown,
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: "Medium",
    color: "text-info",
    icon: Minus,
  },
  [TASK_PRIORITY.HIGH]: {
    label: "High",
    color: "text-warning",
    icon: ChevronUp,
  },
  [TASK_PRIORITY.URGENT]: {
    label: "Urgent",
    color: "text-danger",
    icon: ArrowUpCircle,
  },
} as const;

export const TASK_TYPE_MAPPING = {
  [TASK_TYPE.FEATURE]: {
    label: "Feature",
    color: "text-info",
    icon: Zap,
  },
  [TASK_TYPE.BUG]: {
    label: "Bug",
    color: "text-danger",
    icon: Bug,
  },
  [TASK_TYPE.TASK]: {
    label: "Task",
    color: "text-neutral-500",
    icon: Square,
  },
  [TASK_TYPE.TESTING]: {
    label: "Testing",
    color: "text-success",
    icon: Shield,
  },
  [TASK_TYPE.DOCUMENTATION]: {
    label: "Documentation",
    color: "text-warning",
    icon: FileText,
  },
  [TASK_TYPE.RESEARCH]: {
    label: "Research",
    color: "text-secondary",
    icon: Search,
  },
  [TASK_TYPE.PLANNING]: {
    label: "Planning",
    color: "text-warning",
    icon: Layout,
  },
  [TASK_TYPE.MEETING]: {
    label: "Meeting",
    color: "text-info",
    icon: Users,
  },
  [TASK_TYPE.REVIEW]: {
    label: "Review",
    color: "text-secondary",
    icon: Eye,
  },
  [TASK_TYPE.REFACTOR]: {
    label: "Refactor",
    color: "text-success",
    icon: Zap,
  },
  [TASK_TYPE.DEPLOYMENT]: {
    label: "Deployment",
    color: "text-danger",
    icon: ArrowUpCircle,
  },
  [TASK_TYPE.MAPPING]: {
    label: "Mapping",
    color: "text-tertiary",
    icon: Search,
  },
  [TASK_TYPE.OTHER]: {
    label: "Other",
    color: "text-neutral-400",
    icon: HelpCircle,
  },
} as const;

export const getProjectStatusInfo = (status: ProjectStatus) => 
  PROJECT_STATUS_MAPPING[status] || PROJECT_STATUS_MAPPING[PROJECT_STATUS.PLANNING];

export const getTaskStatusInfo = (status: TaskStatus) => 
  TASK_STATUS_MAPPING[status] || TASK_STATUS_MAPPING[TASK_STATUS.TODO];

export const getTaskPriorityInfo = (priority: TaskPriority) => 
  TASK_PRIORITY_MAPPING[priority] || TASK_PRIORITY_MAPPING[TASK_PRIORITY.LOW];

export const getTaskTypeInfo = (type: TaskType) => 
  TASK_TYPE_MAPPING[type] || TASK_TYPE_MAPPING[TASK_TYPE.TASK];
