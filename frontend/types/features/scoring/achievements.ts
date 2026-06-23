import { Id } from '@/convex/_generated/dataModel'

export interface ScoreLog {
  _id: Id<"scoreLogs">
  _creationTime: number
  userId: Id<"users"> | string
  projectId?: Id<"projects">
  taskId?: Id<"tasks">
  score: number
  reason: string
  taskTitle?: string
  taskDescription?: string
}

export interface UserProjectStats {
  userId: Id<"users"> | string
  projectScore: number
  globalLevel: string
  globalScore: number
  recentLogs: ScoreLog[]
}

export interface LeaderboardMember {
  userId: Id<"users"> | string
  fullName: string
  imageUrl?: string
  role: string
  projectScore: number
  globalLevel: string
}
