'use client'

import * as React from 'react'
import { cn } from '@/lib'
import {
  Typography,
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/atoms'
import { TeamMemberKPI } from '@/types/features'
import { AlertCircle } from 'lucide-react'

interface TeamMemberCardProps {
  member: TeamMemberKPI
  index: number
  isExpanded?: boolean
  onToggle?: () => void
}

export const TeamMemberCard = ({ 
  member, 
  index, 
  isExpanded = false,
  onToggle 
}: TeamMemberCardProps) => {
  const initials = member.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const progressValue = member.completionProgress || 0;
  const totalBonus = member.metrics.earlyCompletions + member.metrics.efficiencyBonuses;

  return (
    <div className="flex flex-col">
      <div 
        onClick={onToggle}
        className={cn(
          "grid grid-cols-[60px_1fr_180px_80px_80px_80px_100px] gap-4 px-8 py-5 items-center cursor-pointer transition-all duration-300",
          isExpanded ? "bg-muted/30" : "hover:bg-muted/10"
        )}
      >
        <Typography className={cn(
          "font-black text-sm",
          index === 0 ? "text-amber-500" : "text-muted-foreground/30"
        )}>
          {index + 1}
        </Typography>

        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/40 shadow-sm">
            <AvatarImage src={member.imageUrl} />
            <AvatarFallback className="bg-muted text-muted-foreground/40 text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Typography className="font-bold text-sm tracking-tight">{member.fullName}</Typography>
              {index === 0 && <span className="text-[10px]">👑</span>}
            </div>
            <div className="flex items-center gap-2">
              <Typography className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">{member.role}</Typography>
              {index === 0 && <Typography className="text-[9px] text-amber-500/80 font-bold uppercase tracking-wider">Top contributor</Typography>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-4">
          <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out",
                index === 0 ? "bg-emerald-500" : 
                index === 1 ? "bg-blue-500" : "bg-amber-500"
              )}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <Typography className="text-[10px] font-black text-muted-foreground/50 w-8">{Math.round(progressValue)}%</Typography>
        </div>

        <Typography className="text-sm font-bold text-center text-foreground/80">{member.metrics.tasksCompleted}</Typography>
        <Typography className="text-sm font-bold text-center text-emerald-500">+{totalBonus}</Typography>
        <Typography className={cn(
          "text-sm font-bold text-center",
          member.metrics.lateCompletions > 0 ? "text-rose-500" : "text-muted-foreground/20"
        )}>
          {member.metrics.lateCompletions > 0 ? `-${member.metrics.lateCompletions}` : "—"}
        </Typography>
        <Typography className={cn(
          "text-lg font-black text-right tracking-tight",
          index === 0 ? "text-foreground" : "text-foreground/80"
        )}>
          {member.totalScore}
        </Typography>
      </div>

      {isExpanded && (
        <div className="px-8 pb-8 pt-2 bg-muted/30 border-t border-border/10 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card/40 border border-border/40 rounded-2xl p-4 space-y-1">
              <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Tasks Done</Typography>
              <Typography className="text-2xl font-black">{member.metrics.tasksCompleted}</Typography>
              <Typography className="text-[10px] text-muted-foreground/60 font-medium">of {member.metrics.tasksCompleted} assigned</Typography>
            </div>
            <div className="bg-card/40 border border-border/40 rounded-2xl p-4 space-y-1">
              <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Bonus</Typography>
              <Typography className="text-2xl font-black text-emerald-500">+{totalBonus}</Typography>
              <Typography className="text-[10px] text-muted-foreground/60 font-medium">{member.metrics.earlyCompletions} early submissions</Typography>
            </div>
            <div className="bg-card/40 border border-border/40 rounded-2xl p-4 space-y-1">
              <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Penalty</Typography>
              <Typography className={cn(
                "text-2xl font-black",
                member.metrics.lateCompletions > 0 ? "text-rose-500" : "text-muted-foreground/20"
              )}>
                {member.metrics.lateCompletions > 0 ? `-${member.metrics.lateCompletions}` : "0"}
              </Typography>
              <Typography className="text-[10px] text-muted-foreground/60 font-medium">{member.metrics.lateCompletions} violations recorded</Typography>
            </div>
            <div className="bg-card/40 border border-border/40 rounded-2xl p-4 space-y-1">
              <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Net Points</Typography>
              <Typography className="text-2xl font-black">{member.totalScore}</Typography>
              <Typography className="text-[10px] text-muted-foreground/60 font-medium">rank #{index + 1} this period</Typography>
            </div>
          </div>

          {member.metrics.lateCompletions > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <Typography className="text-xs font-bold text-rose-500/80">
                {member.metrics.lateCompletions} penalties recorded — follow-up recommended
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
