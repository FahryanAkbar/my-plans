'use client'

import * as React from "react"

import { Table, Loaders, Typography, Button } from "@/components/atoms"
import { 
  EmptyItem, 
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
} from "@/components/molecules"
import { getProjectColumns, ProjectRowProps } from "../monitoring"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export type ProjectTableProps = {
  data: ProjectRowProps[]
  isLoading?: boolean
  totalItems?: number
  startIndex?: number
  endIndex?: number
  totalPages?: number
  currentPage?: number
  limit?: number
  onLimitChange?: (limit: number) => void
  isFirstPage?: boolean
  isLastPage?: boolean
  onPageChange?: (page: number) => void
  isEmpty?: boolean
  searchTerm?: string
}

export const ProjectTable = ({
  data,
  isLoading = false,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  totalPages = 0,
  currentPage = 1,
  limit = 5,
  onLimitChange,
  isFirstPage = true,
  isLastPage = true,
  onPageChange,
  isEmpty = false,
  searchTerm = ""
}: ProjectTableProps) => {
  const columns = React.useMemo(() => 
    getProjectColumns(), 
  [])

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center bg-card rounded-xl border border-border/50">
        <Loaders size="md" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {isEmpty ? (
          <EmptyItem 
            title={searchTerm ? "No projects match your search" : "No projects found"}
            description={searchTerm ? `We couldn't find any projects matching "${searchTerm}".` : "Try creating a new project to start tracking your team's progress."}
            className="min-h-80 border-none"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table 
                data={data} 
                columns={columns}
                className="border-none shadow-none"
                enableSorting={true}
                enablePagination={false} 
              />
            </div>

            {!isEmpty && totalPages >= 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-4 border-t border-border/50 bg-muted/5">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <span>Showing</span>
                    <span className="font-semibold text-foreground">{startIndex}–{endIndex}</span>
                    <span>of</span>
                    <span className="font-semibold text-foreground">{totalItems}</span>
                  </div>
                  
                  <div className="hidden sm:block h-4 w-px bg-border/40" />
                  
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs font-semibold gap-1.5 hover:bg-muted border border-border/20 hover:border-border/50 rounded-md transition-all"
                        >
                          {limit}
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-18 p-1 rounded-xl shadow-lg border-border/40 bg-popover/95 backdrop-blur-md">
                        {[5, 10, 20, 50].map((size) => (
                          <DropdownMenuItem 
                            key={size} 
                            onClick={() => onLimitChange?.(size)}
                            className={cn(
                              "text-xs cursor-pointer rounded-lg px-3 py-1.5 flex justify-center transition-colors",
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
                          e.preventDefault();
                          if (!isFirstPage) onPageChange?.(Math.max(1, currentPage - 1));
                        }}
                        className={cn(
                          "cursor-pointer h-8 px-3 text-xs font-medium rounded-lg hover:bg-muted transition-all",
                          isFirstPage && "opacity-30 pointer-events-none"
                        )}
                      />
                    </PaginationItem>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              onPageChange?.(page);
                            }}
                            className={cn(
                              "cursor-pointer h-8 w-8 text-xs font-semibold rounded-lg transition-all",
                              currentPage === page 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </div>

                    <PaginationItem>
                      <PaginationNext 
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLastPage) onPageChange?.(Math.min(totalPages, currentPage + 1));
                        }}
                        className={cn(
                          "cursor-pointer h-8 px-3 text-xs font-medium rounded-lg hover:bg-muted transition-all",
                          isLastPage && "opacity-30 pointer-events-none"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
