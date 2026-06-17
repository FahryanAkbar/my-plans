import { 
  PlusCircle, 
  CheckCircle2, 
  MessageSquare, 
  Activity, 
  Archive, 
  RefreshCw 
} from "lucide-react";

export const ACTIVITY_CONFIG = {
  created: {
    message: "created a new task",
    icon: PlusCircle,
    color: "text-emerald-500",
  },
  status_changed: {
    message: "moved status of",
    icon: CheckCircle2,
    color: "text-sky-500",
  },
  commented: {
    message: "posted a comment on",
    icon: MessageSquare,
    color: "text-amber-500",
  },
  priority_changed: {
    message: "updated priority of",
    icon: Activity,
    color: "text-rose-500",
  },
  archived: {
    message: "archived task",
    icon: Archive,
    color: "text-slate-500",
  },
  unarchived: {
    message: "restored task",
    icon: RefreshCw,
    color: "text-indigo-500",
  },
  issue_created: {
    message: "reported a new issue",
    icon: PlusCircle,
    color: "text-rose-500",
  },
  issue_resolved: {
    message: "resolved an issue",
    icon: CheckCircle2,
    color: "text-emerald-500",
  }
} as const;
