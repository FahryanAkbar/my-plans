'use client'

import * as React from 'react'
import { Id } from '@/convex/_generated/dataModel'
import {
  Dialog,
  DialogContent,
  Typography,
} from '@/components/atoms'

import { cn } from '@/lib'
import { useAchievements } from '@/hooks'
import { tokens, patterns } from '@/lib/styles'

import { AchievementHeader } from './achievements/achievement-header'
import { BadgeCard } from './achievements/badge-card'

export interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: Id<"projects">
}

export const AchievementsModal = ({ 
  isOpen, 
  onClose,
  projectId 
}: AchievementsModalProps) => {
  const {
    stats,
    leaderboard,
    isLoading,
    userRank,
    badges
  } = useAchievements(projectId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl p-0 overflow-hidden w-[95vw] sm:w-full",
        tokens.border.subtle,
        tokens.shadow.xl,
        tokens.surface.card,
        tokens.radius["2xl"]
      )}>
        <div className="flex flex-col max-h-[90vh]">
          <AchievementHeader 
            onClose={onClose}
            stats={stats}
            userRank={userRank}
            leaderboardLength={leaderboard?.length || 0}
            isLoading={isLoading}
            badges={badges}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-0 space-y-8 sm:space-y-10 custom-scrollbar mt-4 sm:mt-8">
            <section className="space-y-4">
              <Typography className={patterns.textLabel}>
                Project Badges
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
