export type ActivityType = 
  |'create' 
  | 'update' 
  | 'delete' 
  | 'comment' 
  | 'status'

export interface Activity {
  id: string
  userName: string
  userImage?: string
  action: string
  targetName?: string
  targetHref?: string
  timestamp: number
  type: ActivityType
}