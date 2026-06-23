'use client'

import React from "react"
import { UserButton, ClerkLoading } from "@clerk/nextjs"
import { Badge, Loaders } from "@/components/atoms"
import { ModeToggle, NotificationCenter } from "@/components/molecules"
import { cn } from "@/lib"
import { useNotification } from "@/hooks"

interface HeaderActionProps {
  projectIdentity?: {
    name: string
  }
  children?: React.ReactNode
  className?: string
  showUserButton?: boolean
}

export const HeaderAction = ({ 
  projectIdentity,
  children,
  className,
  showUserButton = true
}: HeaderActionProps) => {
  const notificationProps = useNotification()

  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      {projectIdentity?.name && (
        <Badge 
          variant="outline" 
          className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider"
        >
          {projectIdentity.name}
        </Badge>
      )}
      {children}
      <NotificationCenter {...notificationProps} />
      <ModeToggle />
      {showUserButton && (
        <div className="flex items-center justify-center pl-1">
          <ClerkLoading>
            <Loaders size='sm' />
          </ClerkLoading>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-7 w-7"
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

