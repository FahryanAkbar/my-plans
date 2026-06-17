'use client'

import * as React from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Table,
  Input,
  Button
} from '@/components/atoms'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/molecules'
import { ScoreHistoryItem } from '@/types/features'
import { useDebounce } from '@/hooks'
import { EmptyState } from '@/components/organisms/filter/empty-state/empty-state'
import { cn } from '@/lib'
import { tokens, patterns, surfaces } from '@/lib/styles'

interface ScoreHistoryTableProps {
  data: ScoreHistoryItem[]
  columns: ColumnDef<ScoreHistoryItem>[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  category: string
  setCategory: (category: string) => void
  pointType: string
  setPointType: (type: string) => void
}

export const ScoreHistoryTable = ({
  data,
  columns,
  isLoading,
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  pointType,
  setPointType
}: ScoreHistoryTableProps) => {
  const [limit, setLimit] = React.useState(5)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState(searchQuery)
  const debouncedSearchQuery = useDebounce(searchInput, 500)

  React.useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  React.useEffect(() => {
    setSearchQuery(debouncedSearchQuery)
  }, [debouncedSearchQuery, setSearchQuery])

  // Reset page when any filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, category, pointType])

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / limit)
  const startIndex = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0
  const endIndex = Math.min(currentPage * limit, totalItems)
  
  const paginatedData = React.useMemo(() => {
    return data.slice((currentPage - 1) * limit, currentPage * limit)
  }, [data, currentPage, limit])

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages || totalPages === 0

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Efficiency Pro', value: 'efficiency_pro' },
    { label: 'Early Bird Bonus', value: 'task_completed_early' },
    { label: 'Quality Penalty', value: 'quality_penalty_reopened' },
    { label: 'Reward Revoked', value: 'task_reopened_revert' },
  ]

  const pointTypes = [
    { label: 'All Points', value: 'all' },
    { label: 'Positive (+)', value: 'positive' },
    { label: 'Negative (-)', value: 'negative' },
  ]

  const renderPaginationItems = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 'ellipsis', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, 'ellipsis', currentPage, 'ellipsis', totalPages)
      }
    }

    return pages.map((page, index) => {
      if (page === 'ellipsis') {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <span className="flex h-8 w-8 items-center justify-center text-muted-foreground/30 text-[10px]">...</span>
          </PaginationItem>
        )
      }

      return (
        <PaginationItem key={page}>
          <PaginationLink
            isActive={currentPage === page}
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage(page as number)
            }}
            className={cn(
              "cursor-pointer h-8 w-8 text-xs font-semibold transition-all",
              tokens.radius.lg,
              currentPage === page 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className={cn("px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3")}>
        <div className="flex w-full sm:w-auto gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "flex-1 sm:flex-none h-9 px-3 text-xs font-semibold gap-2 border transition-all justify-between sm:justify-center",
                  tokens.surface.neutral,
                  tokens.border.subtle,
                  tokens.radius.lg
                )}
              >
                <span className="truncate">{categories.find(c => c.value === category)?.label || 'Category'}</span>
                <ChevronDown className={cn(tokens.size.iconXs, "opacity-30 shrink-0")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={cn("min-w-40 p-1", surfaces.overlay, tokens.radius.xl)}>
              {categories.map((c) => (
                <DropdownMenuItem 
                  key={c.value} 
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "text-xs cursor-pointer px-3 py-2 flex transition-colors",
                    tokens.radius.lg,
                    category === c.value ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                  )}
                >
                  {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "flex-1 sm:flex-none h-9 px-3 text-xs font-semibold gap-2 border transition-all justify-between sm:justify-center",
                  tokens.surface.neutral,
                  tokens.border.subtle,
                  tokens.radius.lg
                )}
              >
                <span className="truncate">{pointTypes.find(p => p.value === pointType)?.label || 'Point Type'}</span>
                <ChevronDown className={cn(tokens.size.iconXs, "opacity-30 shrink-0")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={cn("min-w-32 p-1", surfaces.overlay, tokens.radius.xl)}>
              {pointTypes.map((p) => (
                <DropdownMenuItem 
                  key={p.value} 
                  onClick={() => setPointType(p.value)}
                  className={cn(
                    "text-xs cursor-pointer px-3 py-2 flex transition-colors",
                    tokens.radius.lg,
                    pointType === p.value ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                  )}
                >
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30", tokens.size.iconXs)} />
          <Input 
            placeholder="Search activity..." 
            maxLength={20}
            className={cn(
              "pl-9 h-9 border focus-visible:ring-0 text-xs",
              tokens.surface.neutral,
              tokens.border.subtle,
              tokens.radius.lg
            )}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className={cn(
        "relative bg-card overflow-hidden shadow-sm border",
        tokens.radius.xl,
        tokens.border.subtle
      )}>
        <div className="overflow-x-auto">
          <Table
            data={paginatedData}
            columns={columns}
            isLoading={isLoading}
            enablePagination={false}
            pageSize={limit}
            className="border-none shadow-none rounded-none"
            emptyMessage={
              <EmptyState
                title="History is empty"
                description="No scoring activity has been recorded yet. New score updates will appear here."
              />
            }
          />
        </div>

        {!isLoading && totalPages >= 1 && (
          <div className={cn(
            "flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-4 border-t border-border/50 bg-muted/5"
          )}>
            <div className="flex items-center gap-5">
              <div className={cn(patterns.textMeta, "flex items-center gap-1.5 whitespace-nowrap")}>
                <span>Showing</span>
                <span className="font-semibold text-foreground">{startIndex}-{endIndex}</span>
                <span>of</span>
                <span className="font-semibold text-foreground">{totalItems}</span>
              </div>
              
              <div className="hidden sm:block h-4 w-px bg-border/40" />
              
              <div className="flex items-center gap-2.5">
                <span className={cn(patterns.textMeta, "whitespace-nowrap")}>Rows per page</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "h-7 px-2 text-xs font-semibold gap-1.5 border transition-all",
                        tokens.radius.md,
                        tokens.border.subtle,
                        "hover:bg-muted"
                      )}
                    >
                      {limit}
                      <ChevronDown className={cn(tokens.size.iconXs, "opacity-50")} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className={cn("min-w-18 p-1", surfaces.overlay, tokens.radius.xl)}>
                    {[5, 10, 20, 50].map((size) => (
                      <DropdownMenuItem 
                        key={size} 
                        onClick={() => {
                          setLimit(size)
                          setCurrentPage(1)
                        }}
                        className={cn(
                          "text-xs cursor-pointer px-3 py-1.5 flex justify-center transition-colors",
                          tokens.radius.lg,
                          limit === size ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                        )}
                      >
                        {size}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-1.5">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isFirstPage) setCurrentPage(p => p - 1)
                    }}
                    className={cn(
                      "cursor-pointer h-8 px-3 text-xs font-medium transition-all",
                      tokens.radius.lg,
                      "hover:bg-muted",
                      isFirstPage && "opacity-30 pointer-events-none"
                    )}
                  />
                </PaginationItem>
                
                <div className="flex items-center gap-1">
                  {renderPaginationItems()}
                </div>

                <PaginationItem>
                  <PaginationNext 
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isLastPage) setCurrentPage(p => p + 1)
                    }}
                    className={cn(
                      "cursor-pointer h-8 px-3 text-xs font-medium transition-all",
                      tokens.radius.lg,
                      "hover:bg-muted",
                      isLastPage && "opacity-30 pointer-events-none"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
