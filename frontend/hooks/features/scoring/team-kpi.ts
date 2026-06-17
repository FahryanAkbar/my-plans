'use client'

import * as React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export const useTeamKPI = (projectId: Id<"projects">, startDate?: number, endDate?: number) => {
  const data = useQuery(api.users.getTeamKPIByProject, { 
    projectId,
    startDate,
    endDate
  })
  const isLoading = data === undefined

  const sortedData = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => b.totalScore - a.totalScore)
  }, [data])

  const stats = React.useMemo(() => {
    if (!sortedData.length) return {
      teamTotalPoints: 0,
      teamTotalTasks: 0,
      teamTotalBonus: 0,
      teamTotalPenalties: 0
    }

    return {
      teamTotalPoints: sortedData.reduce((acc, m) => acc + m.totalScore, 0),
      teamTotalTasks: sortedData.reduce((acc, m) => acc + m.metrics.tasksCompleted, 0),
      teamTotalBonus: sortedData.reduce((acc, m) => acc + (m.metrics.earlyCompletions + m.metrics.efficiencyBonuses), 0),
      teamTotalPenalties: sortedData.reduce((acc, m) => acc + m.metrics.lateCompletions, 0)
    }
  }, [sortedData])

  return {
    data: sortedData,
    isLoading,
    ...stats
  }
}
