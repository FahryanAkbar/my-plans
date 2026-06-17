export const ROLES = {
  PIC: 'PIC',
  FE: 'FE',
  BE: 'BE',
  UIUX: 'UI/UX',
  QA: 'QA',
  BA: 'BA',
} as const 

export const USER_POSITION = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
} as const

export type Role = 
  (typeof ROLES)[keyof typeof ROLES]

export type UserPosition = 
  (typeof USER_POSITION)[keyof typeof USER_POSITION]
