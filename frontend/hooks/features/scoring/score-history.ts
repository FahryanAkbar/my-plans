'use client'

import * as React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export const useScoreHistory = (projectId: Id<"projects">) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [category, setCategory] = React.useState<string>('all')
  const [pointType, setPointType] = React.useState<string>('all')
  
  const data = useQuery(api.scoreLog.getScoreLogs, { projectId })
  const isLoading = data === undefined

  const filteredData = React.useMemo(() => {
    return (data || []).filter(item => {
      const matchesSearch = 
        (item.taskTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = category === 'all' || item.reason === category
      
      const matchesPointType = 
        pointType === 'all' || 
        (pointType === 'positive' && item.score > 0) || 
        (pointType === 'negative' && item.score < 0)

      return matchesSearch && matchesCategory && matchesPointType
    })
  }, [data, searchQuery, category, pointType])

  return {
    data: filteredData,
    isLoading,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    pointType,
    setPointType
  }
}
