export const PROJECT_STATUS = {
  PLANNING: "Planning",
  ONGOING: "In-Progress",
  AT_RISK: "At Risk",
  LATED: "Late",
  COMPLETED: "Completed",
} as const;

export const PROJECT_PLATFORM = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  DESKTOP: 'Desktop',
  OTHER: 'Other',
} as const

export const PROJECT_ACTIVITIES_ACTION = {
  CREATED: "created",
  STATUS_CHANGED: "status-changed",
  ARCHIVED: "archived",
  UNARCHIVED: "unarchived",
  DELETED: "deleted",
  UPDATED: "updated",
} as const

type PlatformBadgeConfig = {
  variant: 
    | "outline"
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "neutral"
    | "destructive"
  className: string
}

export const PROJECT_PLATFORM_BADGE_VARIANT: Record<ProjectPlatform, PlatformBadgeConfig> = {
  Web: {
    variant: "outline",
    className: "text-sky-700 border-sky-300 bg-sky-50 dark:text-sky-300 dark:border-sky-400/40 dark:bg-sky-400/15",
  },
  Mobile: {
    variant: "default",
    className: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/40 dark:bg-emerald-400/15",
  },
  Desktop: {
    variant: "secondary",
    className: "text-violet-700 border-violet-300 bg-violet-50 dark:text-violet-300 dark:border-violet-400/40 dark:bg-violet-400/15",
  },
  Other: {
    variant: "destructive",
    className: "text-rose-700 border-rose-300 bg-rose-50 dark:text-rose-300 dark:border-rose-400/40 dark:bg-rose-400/15",
  }
}

export type ProjectStatus =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export type ProjectActivitiesAction =
  (typeof PROJECT_ACTIVITIES_ACTION)[keyof typeof PROJECT_ACTIVITIES_ACTION];

export type ProjectPlatform =
  (typeof PROJECT_PLATFORM)[keyof typeof PROJECT_PLATFORM];

export type ProjectPlatformBadgeVariant = 
(typeof PROJECT_PLATFORM_BADGE_VARIANT)[keyof typeof PROJECT_PLATFORM_BADGE_VARIANT];
