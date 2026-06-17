import * as React from "react"
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/atoms"
import { cn } from "@/lib/utils"

type User = {
  fullName: string
  imageUrl?: string
}

type AvatarGroupProps = {
  users: User[]
  max?: number
  className?: string
}

export const AvatarGroup = ({
  users,
  max = 3,
  className,
}: AvatarGroupProps) => {
  const visibleUsers = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className={cn("flex items-center", className)}>
      {visibleUsers.map((user, index) => (
        <div
          key={index}
          className={cn(
            "relative",
            index !== 0 && "-ml-3"
          )}
        >
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback>
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}

      {remaining > 0 && (
        <div className="-ml-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-background">
            +{remaining}
          </div>
        </div>
      )}
    </div>
  )
}

function getInitials(name?: string) {
  if (!name) return ""

  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
}