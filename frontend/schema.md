# schema.ts update (harus ditambahkan)

Tambahkan atau perbarui file `convex/schema.ts` dengan skema berikut. Kode sudah diformat sebagai blok TypeScript agar mudah disalin.

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ===============================
  // [MODIFIKASI] DOCUMENTS (Jotion Core + Project Support)
  // ===============================
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),

    // Relasi ke project
    projectId: v.optional(v.id("projects")),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_project", ["projectId"]),

  // ===============================
  // [BARU] USERS (Auth Mapping + Gamification)
  // ===============================
  users: defineTable({
    clerkId: v.string(),
    fullName: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),

    // Gamification
    performanceScore: v.number(),

    // Metadata
    level: v.optional(v.string()),
    isActive: v.boolean(),

    // Audit
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_score", ["performanceScore"]),

  // ===============================
  // [BARU] PROJECT MONITORING
  // ===============================
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // PIC / Manager
    managerId: v.string(),

    // Timeline
    startDate: v.number(),
    endDate: v.optional(v.number()),

    // Status & progress
    status: v.string(), // "planning", "ongoing", "completed"
    progress: v.number(),

    isArchived: v.boolean(),

    // for collaboration docs
    isCollaborative: v.optional(v.boolean()),
    lastEditedBy: v.optional(v.string()),

    // Identifier (opsional tapi disarankan)
    key: v.optional(v.string()), // contoh: PROJ-1

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_manager", ["managerId"])
    .index("by_status", ["status"]),

  // ===============================
  // [BARU] TEAM MANAGEMENT (RBAC CORE)
  // ===============================
  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),

    // Role (PIC, FE, BE, QA, dll)
    role: v.string(),

    // Optional granular permission
    permissions: v.optional(v.array(v.string())),

    joinedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_and_user", ["projectId", "userId"]),

  // ===============================
  // [BARU] TASK MANAGEMENT
  // ===============================
  tasks: defineTable({
    projectId: v.id("projects"),

    title: v.string(),
    description: v.optional(v.string()),

    // Type & status
    type: v.string(), // "feature", "bug", "task"
    status: v.string(), // "todo", "in_progress", "done"
    priority: v.string(), // "low", "medium", "high"

    // Assignment
    assigneeId: v.optional(v.string()),
    reporterId: v.string(),

    // Timeline
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),

    // Estimation (analytics)
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),

    // Gamification
    scoreValue: v.number(),

    // Collaboration
    watchers: v.optional(v.array(v.string())),

    isArchived: v.boolean(),

    // Audit
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_assignee", ["assigneeId"])
    .index("by_project_status", ["projectId", "status"]),

  // ===============================
  // [BARU] ISSUE TRACKING (dipisah dari task)
  // ===============================
  issues: defineTable({
    projectId: v.id("projects"),

    title: v.string(),
    description: v.optional(v.string()),

    severity: v.string(), // "low", "medium", "high", "critical"
    status: v.string(), // "open", "in_progress", "resolved"

    reporterId: v.string(),
    assigneeId: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  // ===============================
  // [BARU] TASK ACTIVITIES (Audit Log)
  // ===============================
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

  // ===============================
  // [BARU] SCORE LOGS (Gamification Tracking)
  // ===============================
  scoreLogs: defineTable({
    userId: v.string(),
    taskId: v.optional(v.id("tasks")),

    score: v.number(),
    reason: v.string(), // "task_completed", dll

    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ===============================
  // [BARU] PROJECT STATS (Analytics Result)
  // ===============================
  projectStats: defineTable({
    projectId: v.id("projects"),

    totalTasks: v.number(),
    completedTasks: v.number(),
    completionRate: v.number(),

    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"]),
});