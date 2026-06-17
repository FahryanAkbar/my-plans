import { Id } from '@/convex/_generated/dataModel'

export interface UserScoreCardProps {
  projectId: Id<"projects">
  className?: string
}

export interface LevelConfig {
  color: string
  label: string
}
