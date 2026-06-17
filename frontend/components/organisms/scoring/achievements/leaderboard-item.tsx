'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib'
import { Typography, Avatar, AvatarImage, AvatarFallback, Badge } from '@/components/atoms'
import { tokens, patterns } from '@/lib/styles'
import { LeaderboardMember } from '@/types/features'

interface LeaderboardItemProps {
  member: LeaderboardMember
  index: number
  isCurrentUser: boolean
}

export const LeaderboardItem = ({ member, index, isCurrentUser }: LeaderboardItemProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 group transition-all",
      tokens.radius.xl,
      tokens.border.subtle,
      isCurrentUser 
        ? "bg-muted/10 shadow-sm ring-1 ring-border" 
        : "bg-transparent hover:bg-muted/5"
    )}>
      <div className="flex items-center gap-4">
        <Typography className={cn(
          "font-black text-xs w-4",
          index === 0 ? "text-amber-500" : 
          index === 1 ? "text-zinc-400" :
          index === 2 ? "text-amber-700" : "text-muted-foreground/30"
        )}>
          {index + 1}
        </Typography>
        <Avatar className={cn(tokens.size.avatarMd, patterns.avatarSubtle)}>
          <AvatarImage src={member.imageUrl} />
          <AvatarFallback className={cn(tokens.fontSize.xs, tokens.fontWeight.bold)}>
            {member.fullName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Typography className="font-bold text-sm tracking-tight leading-none">
              {member.fullName}
            </Typography>
            {isCurrentUser && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "h-4 px-1.5 font-black border-none rounded-full uppercase tracking-tighter text-[9px]",
                  tokens.badge.primary
                )}
              >
                You
              </Badge>
            )}
          </div>
          <Typography className={cn(patterns.textLabel, "mt-1")}>
            {member.role} · <span className="lowercase">beginner</span>
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Typography className={cn("font-bold text-sm tracking-tight", tokens.color.success)}>
          {member.projectScore.toLocaleString()} pts
        </Typography>
        <ChevronRight className={cn(tokens.size.iconSm, "text-muted-foreground/30")} />
      </div>
    </div>
  )
}
