'use client'

import * as React from 'react'

export interface EmailExistenceInfo {
  email: string
  isRegistered: boolean
  isMember: boolean
  user?: {
    fullName: string
    imageUrl?: string
  }
}

interface EmailStatusMessageProps {
  info?: EmailExistenceInfo
}

export const EmailStatusMessage = ({ info }: EmailStatusMessageProps) => {
  if (!info) return null

  if (info.isMember) {
    return (
      <span className="text-[10px] text-amber-600 font-medium px-3 animate-in fade-in slide-in-from-top-1 duration-200">
        Already a member of this project
      </span>
    )
  }

  if (info.isRegistered) {
    return (
      <span className="text-[10px] text-blue-600 font-medium px-3 animate-in fade-in slide-in-from-top-1 duration-200">
        User is already registered: {info.user?.fullName}
      </span>
    )
  }

  return null
}
