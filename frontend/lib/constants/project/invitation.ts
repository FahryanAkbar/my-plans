export const INVITATION_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
} as const

export const INVITATION_DEFAULT_POSITION = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
} as const

export type InvitationPosition = 
  typeof INVITATION_DEFAULT_POSITION[keyof typeof INVITATION_DEFAULT_POSITION]

export type InvitationStatus = 
  typeof INVITATION_STATUS[keyof typeof INVITATION_STATUS]
