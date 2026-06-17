export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  COMMENT_TAGGED: 'COMMENT_TAGGED',
  PROJECT_INVITATION: 'PROJECT_INVITATION',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  STATUS_CHANGED: 'STATUS_CHANGED',
} as const

export const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPE.TASK_ASSIGNED]: {
    color: 'var(--info)', 
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
  },
  [NOTIFICATION_TYPE.COMMENT_TAGGED]: {
    color: 'var(--secondary)', 
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
    text: 'text-secondary',
  },
  [NOTIFICATION_TYPE.PROJECT_INVITATION]: {
    color: 'var(--success)', 
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
  },
  [NOTIFICATION_TYPE.MEMBER_REMOVED]: {
    color: 'var(--danger)', 
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    text: 'text-danger',
  },
  [NOTIFICATION_TYPE.STATUS_CHANGED]: {
    color: 'var(--warning)', 
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
  },
} as const;

export const NOTIFICATION_STATUS = {
  UNREAD: 'UNREAD',
  READ: 'READ',
} as const

export type NotificationType = 
  typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE]

export type NotificationColors = 
  typeof NOTIFICATION_COLORS[keyof typeof NOTIFICATION_COLORS]

export type NotificationStatus = 
  typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS]
