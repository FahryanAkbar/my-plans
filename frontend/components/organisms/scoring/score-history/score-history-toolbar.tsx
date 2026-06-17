'use client'

import * as React from 'react'
import { 
  Search, 
} from 'lucide-react'
import {
  Input,
} from '@/components/atoms'

interface ScoreHistoryToolbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const ScoreHistoryToolbar = ({
  searchQuery,
  setSearchQuery
}: ScoreHistoryToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 w-full">
      <div className="flex items-center gap-3 w-full sm:max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300" />
          <Input 
            placeholder="Search history..." 
            className="pl-10 h-10 w-full bg-muted/10 border-border/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 transition-all rounded-xl text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
