export const PERMISSIONS = {
  PROJECT_CREATE: "project.create",
  PROJECT_DELETE: "project.delete",
  PROJECT_UPDATE: "project.update",

  MEMBER_INVITE: "member.invite",
  MEMBER_REMOVE: "member.remove",

  TASK_CREATE: "task.create",
  TASK_UPDATE: "task.update",
  TASK_DELETE: "task.delete",
  TASK_ASSIGN: "task.assign",
  TASK_ARCHIVE: "task.archive",
  TASK_REORDER: "task.reorder",

  TIMELINE_MANAGE: "timeline.manage",

  DAILY_LOG_CREATE: "daily_log.create",
  DAILY_LOG_VIEW: "daily_log.view",

  ISSUE_CREATE: "issue.create",
  ISSUE_UPDATE: "issue.update",
  ISSUE_RESOLVE: "issue.resolve",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
