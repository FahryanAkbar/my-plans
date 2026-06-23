'use client'

import { Typography, DialogTitle, Badge } from '@/components/atoms'
import { UserProjectStats } from '@/types/features'
import { cn } from '@/lib'

interface AchievementHeaderProps {
  onClose: () => void
  stats: UserProjectStats | null | undefined
  userRank: number
  leaderboardLength: number
  isLoading: boolean
  badges: Array<{
    id: number
    name: string
    description: string
    unlocked: boolean
    color: string
  }>
}

export const AchievementHeader = ({ 
  stats, 
  userRank, 
  leaderboardLength,
  isLoading,
  badges
}: AchievementHeaderProps) => {
  const projectScore = stats?.projectScore || 0;

  const nextBadge = badges?.find(b => !b.unlocked && b.description.includes('project points')) || badges?.[badges.length - 1];
  const targetPoints = parseInt(nextBadge?.description.match(/\d+/)?.[0] || '100');
  const progressPercent = Math.min(Math.round((projectScore / targetPoints) * 100), 100);

  return (
    <div className="p-4 sm:p-8 border-b border-border/40 space-y-6 sm:space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <Typography className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/50 uppercase">
            REWARDS & MILESTONES
          </Typography>
          <DialogTitle className="text-2xl sm:text-3xl font-medium tracking-tight m-0 text-foreground">
            Achievements
          </DialogTitle>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Project points', value: projectScore.toLocaleString(), sub: `from target 100` },
          { label: 'Your rank', value: isLoading ? '...' : `#${userRank}`, sub: `from ${leaderboardLength} members` },
          { label: 'Global rank', value: stats?.globalLevel || 'Beginner', sub: 'Level 1', isBadge: true }
        ].map((item, i) => (
          <div key={i} className={cn("bg-muted/5 border border-border/40 rounded-xl p-3 sm:p-4 space-y-2", i === 2 && "col-span-2 sm:col-span-1")}>
            <Typography className="text-[11px] font-medium text-muted-foreground/60 tracking-tight">
              {item.label}
            </Typography>
            <div className="space-y-1">
              <Typography className="text-2xl font-medium tracking-tight leading-none">
                {item.value}
              </Typography>
              {item.isBadge ? (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border-none px-2 py-0 rounded-full text-[9px] font-bold">
                  {item.sub}
                </Badge>
              ) : (
                <Typography className="text-[10px] font-medium text-muted-foreground/40 italic">
                  {item.sub}
                </Typography>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Typography className="text-[11px] font-medium text-muted-foreground tracking-tight">
            Towards <span className="text-foreground font-bold">{nextBadge?.name.charAt(0) + nextBadge?.name.slice(1).toLowerCase().replace('_', ' ')}</span> — {projectScore} / {targetPoints} points
          </Typography>
          <Typography className={cn("text-[11px] font-black", progressPercent >= 100 ? "text-emerald-500" : "text-primary/60")}>
            {progressPercent}%
          </Typography>
        </div>
        <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              progressPercent >= 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-primary"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
