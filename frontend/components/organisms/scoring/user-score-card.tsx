'use client'

import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib'
import { 
  Typography,
  Card,
  Badge,
  Button
} from '@/components/atoms'
import { useUserScoreCard } from '@/hooks'
import { UserScoreCardProps } from '@/types/features'
import { layouts, patterns, tokens } from '@/lib/styles'

import { AchievementsModal } from './achievements-modal'
import { ScoreCardSkeleton } from './user-score-card/score-card-skeleton'


export const UserScoreCard = ({ projectId, className }: UserScoreCardProps) => {
  const {
    stats,
    isLoading,
    isModalOpen,
    setIsModalOpen
  } = useUserScoreCard(projectId)

  if (isLoading) {
    return <ScoreCardSkeleton className={className} />
  }

  if (!stats) return null

  const { 
    projectScore, 
    lastEarning, 
    progressPercent, 
    levelConfig, 
    pointsToNext,
    badgesEarned,
    totalBadges,
  } = stats

  return (
    <>
      <Card className={cn(
        "p-6",
        tokens.radius["2xl"],
        className
      )}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_auto] items-start gap-4 md:gap-0">
            <div className="flex flex-col gap-2 md:pr-12">
              <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]")} />
                <Badge variant="secondary" className={cn(
                  "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-none px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  "text-[10px]"
                )}>
                  {levelConfig.label}
                </Badge>
              </div>
              
              <div className="flex flex-col">
                <Typography className="text-5xl font-medium tracking-tight leading-none">
                  {projectScore.toLocaleString()}
                </Typography>
                <Typography className={cn(
                  tokens.fontSize.base,
                  tokens.fontWeight.medium,
                  tokens.color.muted,
                  "mt-1 tracking-tight"
                )}>
                  project points
                </Typography>
              </div>
            </div>

            <div className="hidden md:block w-px h-24 bg-border/40 self-center" />

            <div className="flex flex-col gap-2 md:px-12">
              <Typography className={patterns.textLabel}>
                Last session points
              </Typography>
              
              <div className="flex flex-col">
                <Typography className="text-3xl font-medium tracking-tight leading-none text-foreground/90">
                  {lastEarning} pts
                </Typography>
                <Typography className={cn(
                  tokens.fontSize.xs,
                  tokens.fontWeight.medium,
                  "text-muted-foreground/50 mt-1.5"
                )}>
                  {lastEarning === 0 ? "No activity recorded this session" : "Activity recorded this session"}
                </Typography>
              </div>
            </div>

            <div className="hidden md:block w-px h-24 bg-border/40 self-center" />

            <div className="flex flex-col items-end gap-3 md:pl-12 ml-auto">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  "h-10 px-5 hover:bg-muted/50 transition-all font-bold text-sm tracking-tight group",
                  tokens.radius.xl,
                  tokens.border.base
                )}
              >
                Achievements
                <ArrowRight className={cn(tokens.size.iconSm, "ml-2 transition-transform group-hover:translate-x-1")} />
              </Button>
              <Typography className={cn(
                "text-[11px] font-medium text-muted-foreground/50 tracking-tight text-right"
              )}>
                {badgesEarned} of {totalBadges} badges earned
              </Typography>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className={layouts.flexBetween}>
              <Typography className={cn(tokens.fontSize.xs, tokens.fontWeight.medium, tokens.color.muted, "tracking-tight")}>
                Next milestone — <span className="text-muted-foreground/40">moving to the next level</span>
              </Typography>
              <Typography className={cn(tokens.fontSize.xs, tokens.fontWeight.medium, "tracking-tight")}>
                <span className="text-muted-foreground/60">{pointsToNext} pts left</span>
                <span className="ml-2 font-bold text-foreground">{progressPercent}%</span>
              </Typography>
            </div>
            
            <div className={cn("relative h-2 w-full bg-muted/30 dark:bg-muted/20 overflow-hidden shadow-inner", tokens.radius.full)}>
              <div 
                className="absolute left-0 top-0 h-full bg-linear-to-r from-primary/60 via-primary to-primary/80 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <AchievementsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
      />
    </>
  )
}
