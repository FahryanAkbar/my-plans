'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export const useAchievements = (projectId: Id<"projects">) => {
  const stats = useQuery(api.scoreLog.getUserProjectStats, { projectId })
  const leaderboard = useQuery(api.scoreLog.getProjectLeaderboard, { projectId })
  
  const isLoading = stats === undefined || leaderboard === undefined

  const userRank = (leaderboard?.findIndex(m => m.userId === stats?.userId) ?? -1) + 1
  const isTopScorer = userRank === 1 && (stats?.projectScore ?? 0) > 0

  const badges = [
    { 
      id: 1, 
      name: 'EARLY BIRD', 
      description: 'Reach 100 project points', 
      unlocked: (stats?.projectScore || 0) >= 100, 
      color: 'text-amber-500' 
    },
    { 
      id: 2, 
      name: 'CLOSER', 
      description: 'Reach 500 project points', 
      unlocked: (stats?.projectScore || 0) >= 500, 
      color: 'text-blue-500' 
    },
    { 
      id: 3, 
      name: 'BUG HUNTER', 
      description: 'Reach 1,000 project points', 
      unlocked: (stats?.projectScore || 0) >= 1000, 
      color: 'text-emerald-500' 
    },
    { 
      id: 4, 
      name: 'TEAM PLAYER', 
      description: 'Contribute to 5 different tasks', 
      unlocked: (stats?.recentLogs?.length || 0) >= 5, 
      color: 'text-purple-500' 
    },
    { 
      id: 5, 
      name: 'CONSISTENCY', 
      description: 'Complete 10 activities in one project', 
      unlocked: (stats?.recentLogs?.length || 0) >= 10, 
      color: 'text-rose-500' 
    },
    { 
      id: 6, 
      name: 'TOP SCORER', 
      description: 'Be #1 in project leaderboard', 
      unlocked: isTopScorer, 
      color: 'text-amber-600' 
    },
  ]

  return {
    stats,
    leaderboard,
    isLoading,
    userRank,
    isTopScorer,
    badges
  }
}
