import { PROJECT_PLATFORM, ProjectPlatform, ProjectStatus } from "@/lib/constants"
export type ProjectPriority = "high" | "medium" | "low"

export type ProjectData = {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  platform: ProjectPlatform,
  progress: number
  dueDate: string
  tasksTotal: number
  tasksDone: number
  members: { fullName: string; imageUrl?: string }[],
  projectImage: string
  tags?: string[]
}

export const PROJECT_TRACKER_DATA: ProjectData[] = [
  {
    id: "1",
    name: "Atlassian App Redesign",
    description: "Full redesign of the core product UI",
    status: "In-Progress",
    priority: "high",
    platform: "Web",
    progress: 68,
    dueDate: "Aug 20, 2025",
    tasksTotal: 32,
    tasksDone: 22,
    members: [
      { 
        fullName: "John Doe",
        imageUrl: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2"
      },
      { 
        fullName: "Jane Smith",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      }, 
      { 
        fullName: "Sarah Kim",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      }
    ],
    projectImage: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9",
    tags: ["Design", "Frontend"],
  },

  {
    id: "2",
    name: "Landing Page Revamp",
    description: "Improve conversion rate through new landing page",
    status: "At Risk",
    priority: "high",
    platform: "Web",
    progress: 45,
    dueDate: "Aug 25, 2025",
    tasksTotal: 20,
    tasksDone: 9,
    members: [
      { 
        fullName: "Michael Lee",
        imageUrl: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2"
      }, 
      { 
        fullName: "Sarah Kim",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      }
    ],
    projectImage: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9",
    tags: ["Marketing", "Frontend"],
  },

  {
    id: "3",
    name: "API Integration v2",
    description: "Connect third-party services to backend",
    status: "Completed",
    priority: "medium",
    platform: "Mobile",
    progress: 12,
    dueDate: "Sep 10, 2025",
    tasksTotal: 18,
    tasksDone: 2,
    members: [
      { 
        fullName: "Michael Lee",
        imageUrl: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2"
      }, 
      { 
        fullName: "John Doe",
        imageUrl: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2"
      }
    ],
    projectImage: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9",
    tags: ["Backend"],
  },

  {
    id: "4",
    name: "Mobile App Beta",
    description: "Beta release of the iOS & Android app",
    status: "Planning",
    priority: "medium",
    platform: "Mobile",
    progress: 80,
    dueDate: "Sep 1, 2025",
    tasksTotal: 40,
    tasksDone: 32,
    members: [
      { 
        fullName: "Michael Lee",
        imageUrl: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2"
      }, 
      { 
        fullName: "John Doe",
        imageUrl: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2"
      },
      { 
        fullName: "Sarah Kim",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      },
      { 
        fullName: "Jane Smith",
        imageUrl: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9"
      }
    ],
    projectImage: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9",
    tags: ["Mobile"],
  },

  {
    id: "5",
    name: "Q3 Analytics Dashboard",
    description: "Internal analytics for stakeholders",
    status: "Completed",
    priority: "low",
    platform: "Web",
    progress: 100,
    dueDate: "Jul 31, 2025",
    tasksTotal: 14,
    tasksDone: 14,
    members: [
      {
        fullName: "Jane Smith",
        imageUrl: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9"
      }
    ],
    projectImage: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9",
    tags: ["Data", "Frontend"],
  },
]

export const priorityConfig: Record<ProjectPriority, { label: string; className: string }> = { 
  high:   { label: "High",   className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  medium: { label: "Medium", className: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  low:    { label: "Low",    className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
}

export const PLATFORM_CONFIG: Record<
  ProjectPlatform,
  { label: string; className: string }
> = {
  [PROJECT_PLATFORM.WEB]: {
    label: "WEB",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  [PROJECT_PLATFORM.MOBILE]: {
    label: "MOBILE",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  [PROJECT_PLATFORM.DESKTOP]: {
    label: "DESKTOP",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  [PROJECT_PLATFORM.OTHER]: {
    label: "OTHER",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};