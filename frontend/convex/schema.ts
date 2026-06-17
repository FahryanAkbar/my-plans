import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
   users: defineTable({
    clerkId: v.string(),
    fullName: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    performanceScore: v.number(),
    level: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_score", ["performanceScore"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    managerId: v.id("users"),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.string(),
    progress: v.number(),  
    platform: v.optional(v.string()),

    projectImage: v.optional(v.string()),
    isArchived: v.boolean(),
    isCollaborative: v.optional(v.boolean()),
    lastEditedBy: v.optional(v.string()),

    key: v.optional(v.string()),
    inviteToken: v.optional(v.string()),
    inviteMaxUses: v.optional(v.union(v.null(), v.number())),
    inviteUseCount: v.optional(v.number()),
    defaultJoinRole: v.optional(v.string()),
    defaultJoinPosition: v.optional(v.string()),
    icon: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_manager", ["managerId"])
    .index("by_status", ["status"])
    .index("by_invite_token", ["inviteToken"]),

  projectInvitations: defineTable({
    projectId: v.id("projects"),
    email: v.string(),

    position: v.string(),
    role: v.string(),
    invitedBy: v.id("users"),

    status: v.string(),
    token: v.string(),
    expiresAt: v.number(),

    acceptedBy: v.optional(v.id("users")),
    acceptedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_email", ["email"])
    .index("by_project_and_email", ["projectId", "email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  
  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),

    role: v.string(),
    position: v.string(),
    permissions: v.optional(v.array(v.string())),
    joinedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_and_user", ["projectId", "userId"]),

  projectActivities: defineTable({
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
    action: v.string(),    // Contoh: "created", "status_changed", "archived"
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_created", ["projectId", "createdAt"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),

    type: v.string(), // "feature", "bug", "task"
    status: v.string(), // "todo", "in_progress", "done"
    priority: v.string(), // "low", "medium", "high"

    assigneeId: v.optional(v.string()),
    reporterId: v.string(),

    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.union(v.number(), v.null())),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.union(v.number(), v.null())),
    lastStatusChangedAt: v.optional(v.number()),

    scoreValue: v.number(),
    watchers: v.optional(v.array(v.string())),
    isArchived: v.boolean(),
    index: v.optional(v.number()),

    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_assignee", ["assigneeId"])
    .index("by_project_status", ["projectId", "status"]),
  
  issues: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),

    severity: v.string(), // "low", "medium", "high", "critical"
    status: v.string(), // "open", "in_progress", "resolved", "closed"
    priority: v.optional(v.string()), // "p0", "p1", "p2", "p3"

    reporterId: v.string(),
    assigneeId: v.optional(v.string()),
    
    labels: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())), // Storage IDs for screenshots
    linkedTaskId: v.optional(v.union(v.id("tasks"), v.null())), // Relasi ke task terkait
    
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_project_severity", ["projectId", "severity"])
    .index("by_assignee", ["assigneeId"])
    .index("by_reporter", ["reporterId"]),

  taskActivities: defineTable({
    taskId: v.id("tasks"),
    userId: v.string(),

    action: v.string(), // "created", "status_changed", dll
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_task", ["taskId"]),

  issueActivities: defineTable({
    issueId: v.id("issues"),
    userId: v.string(),

    action: v.string(), // "created", "status_changed", dll
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_issue", ["issueId"]),

  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    projectId: v.optional(v.id("projects")),
    updatedAt: v.optional(v.number()),
  })
  .index("by_user", ["userId"])
  .index("by_user_parent", ["userId", "parentDocument"]),

  scoreLogs: defineTable({
    userId: v.string(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    taskTitle: v.optional(v.string()),
    taskDescription: v.optional(v.string()),
    baseScore: v.optional(v.number()),

    score: v.number(),
    reason: v.string(), // "task_completed", dll
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_task", ["taskId"]),

  projectStats: defineTable({
    projectId: v.id("projects"),

    totalTasks: v.number(),
    completedTasks: v.number(),
    inProgressTasks: v.optional(v.number()),
    overdueTasks: v.optional(v.number()),
    completedTasksWithDueDate: v.optional(v.number()),
    onTimeCompletedTasks: v.optional(v.number()),
    onTimeCompletionRate: v.optional(v.number()),
    completionRate: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  dailyLogs: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),

    title: v.optional(v.string()),
    date: v.number(),
    
    content: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_and_date", ["projectId", "date"])
    .index("by_user_and_project", ["userId", "projectId"]),

  taskComments: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    parentId: v.optional(v.id("taskComments")),
    content: v.string(),
    mentionedUserIds: v.optional(v.array(v.id("users"))),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_task_created", ["taskId", "createdAt"])
    .index("by_parent", ["parentId"]),

  issueComments: defineTable({
    issueId: v.id("issues"),
    userId: v.id("users"),
    parentId: v.optional(v.id("issueComments")),
    content: v.string(),
    mentionedUserIds: v.optional(v.array(v.id("users"))),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_issue", ["issueId"])
    .index("by_issue_created", ["issueId", "createdAt"])
    .index("by_parent", ["parentId"]),

  commentReactions: defineTable({
    commentId: v.id("taskComments"),
    userId: v.id("users"),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_comment", ["commentId"])
    .index("by_comment_user_emoji", ["commentId", "userId", "emoji"]),
  
  notifications: defineTable({
    userId: v.id("users"),
    senderId: v.optional(v.id('users')),
    type: v.union(
      v.literal('TASK_ASSIGNED'),
      v.literal('COMMENT_TAGGED'),
      v.literal('PROJECT_INVITATION'),
      v.literal('MEMBER_REMOVED'),
      v.literal('STATUS_CHANGED')
    ),
    title: v.string(),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
    createdAt: v.number()
  })
    .index("by_user_id", ["userId"])
    .index("by_user_read_status", ["userId", "isRead"]),
});
