'use client'

import * as React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export const useUserScoreCard = (projectId: Id<"projects">) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const stats = useQuery(api.scoreLog.getUserProjectStats, { projectId })
  const leaderboard = useQuery(api.scoreLog.getProjectLeaderboard, { projectId })
  const isLoading = stats === undefined

  const getLevelConfig = (lvl: string) => {
    const l = lvl?.toLowerCase() || ''
    if (l.includes('expert') || l.includes('pro')) return { color: 'text-amber-500', label: 'EXPERT' }
    if (l.includes('intermediate')) return { color: 'text-blue-500', label: 'INTERMEDIATE' }
    return { color: 'text-primary', label: 'BEGINNER' }
  }

  const nextLevelThreshold = 1000
  
  const processedStats = React.useMemo(() => {
    if (!stats) return null
    
    const { projectScore, globalLevel, recentLogs } = stats
    const lastEarning = recentLogs?.[0]?.score || 0
    const progressPercent = Math.min(Math.round((projectScore / nextLevelThreshold) * 100), 100)
    const userRank = (leaderboard?.findIndex((m) => m.userId === stats.userId) ?? -1) + 1
    const isTopScorer = userRank === 1 && projectScore > 0

    const badges = [
      projectScore >= 100,
      projectScore >= 500,
      projectScore >= 1000,
      (recentLogs?.length || 0) >= 5,
      (recentLogs?.length || 0) >= 10,
      isTopScorer,
    ]
    const badgesEarned = badges.filter(Boolean).length
    
    return {
      projectScore,
      globalLevel,
      lastEarning,
      progressPercent,
      levelConfig: getLevelConfig(globalLevel),
      pointsToNext: nextLevelThreshold - projectScore,
      badgesEarned,
      totalBadges: badges.length,
    }
  }, [stats, leaderboard])

  return {
    stats: processedStats,
    isLoading,
    isModalOpen,
    setIsModalOpen
  }
}
