export interface ScoreHistoryItem {
  _id: string
  taskId?: string
  taskTitle?: string
  taskDescription?: string
  baseScore?: number
  score: number
  reason: string
  createdAt: number
  userName?: string
  userImageUrl?: string
}