'use client'

import * as React from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib'
import { useScoreHistory } from '@/hooks'

import { TooltipProvider } from '@/components/atoms'
import { getScoreHistoryColumns } from './score-history/score-history-columns'
import { ScoreHistoryTable } from './score-history/score-history-table'

export interface ScoreHistoryProps {
  projectId: Id<"projects">
  className?: string
}

export const ScoreHistory = ({
  projectId,
  className
}: ScoreHistoryProps) => {
  const {
    data,
    isLoading,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    pointType,
    setPointType
  } = useScoreHistory(projectId)

  const columns = React.useMemo(() => getScoreHistoryColumns(), [])

  return (
    <TooltipProvider>
      <div className={cn("w-full", className)}>
        <ScoreHistoryTable 
          data={data}
          columns={columns}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
          pointType={pointType}
          setPointType={setPointType}
        />
      </div>
    </TooltipProvider>
  )
}
