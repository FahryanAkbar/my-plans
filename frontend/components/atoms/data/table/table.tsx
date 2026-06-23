/* eslint-disable react-hooks/incompatible-library */
'use client'

import React, { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

import {
  ColumnDef,
  ExpandedState,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowData
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string
    className?: string
  }
}

import { Loaders, Button } from '@/components/atoms'
import { 
  NativeSelect,
  NativeSelectOption,
} from '@/components/atoms'
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis
} from '@/components/molecules'

import { cn } from '@/lib'
import { PaginationMeta } from '@/types'

export interface TableProps<TData extends object> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  onRowClick?: (row: Row<TData>) => void
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  pageSize?: number
  enableRowSelection?: boolean
  getSubRows?: (originalRow: TData, index: number) => TData[] | undefined
  className?: string
  emptyMessage?: React.ReactNode
  paginationInfo?: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  state?: {
    rowSelection?: RowSelectionState
  }
  isLoading?: boolean
}

function PaginationController({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisible?: number
  className?: string
}) {
  const pages: (number | 'ellipsis')[] = []
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

const Table = <TData extends object>({
  data,
  columns,
  onRowClick,
  onRowSelectionChange,
  enableSorting = true,
  enableFiltering = false,
  enablePagination = false,
  pageSize = 10,
  enableRowSelection = false,
  getSubRows,
  className,
  emptyMessage = 'No data available',
  paginationInfo,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 30, 50],
  state: externalState,
  isLoading = false,
}: TableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  })

  React.useEffect(() => {
    setPagination((prev) => {
      if (prev.pageSize !== pageSize) {
        return { ...prev, pageSize }
      }
      return prev
    })
  }, [pageSize])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getSubRows ? getExpandedRowModel() : undefined,
    getSubRows,
    manualPagination: !!paginationInfo,
    pageCount: paginationInfo?.total_page,
    state: {
      sorting,
      expanded,
      globalFilter,
      rowSelection: externalState?.rowSelection ?? internalRowSelection,
      pagination: paginationInfo
        ? { pageIndex: paginationInfo.current_page - 1, pageSize: paginationInfo.size }
        : pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: onRowSelectionChange || setInternalRowSelection,
    enableRowSelection,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRowId: (row: any) => row.id || row.uuid || row.index,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const { pageIndex, pageSize: statePageSize } = table.getState().pagination

  const startRange = data.length > 0 ? pageIndex * statePageSize + 1 : 0
  const endRange = Math.min(
    startRange + table.getRowModel().rows.length - 1,
    paginationInfo?.total_element ?? data.length,
  )

  return (
    <div
      className={cn(
        'flex w-full flex-col rounded-xl border border-border-primary bg-card shadow-sm overflow-hidden relative',
        className,
      )}
    >
      {enableFiltering && (
        <div className="p-4 border-b border-border-primary">
          <div className="relative max-w-xs">
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search data..."
              className="flex h-10 w-full rounded-lg border border-border-primary bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      )}

      <div className="relative w-full">
        <div 
          className={cn(
            "w-full transition-all duration-300",
            !isMobileExpanded ? "overflow-hidden sm:overflow-x-auto" : "overflow-x-auto"
          )}
        >
          <table className="w-full text-xs md:text-sm border-separate border-spacing-0 min-w-150 md:min-w-full">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "h-10 px-3 md:py-4 text-left align-middle font-bold text-text-primary border-b border-border-primary whitespace-nowrap text-xs md:text-sm relative group",
                        header.column.columnDef.meta?.headerClassName
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center w-full h-full',
                            header.column.getCanSort() && 'cursor-pointer select-none',
                            header.column.columnDef.meta?.headerClassName?.includes('center') && 'justify-center',
                            header.column.columnDef.meta?.headerClassName?.includes('right') && 'justify-end'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className={cn(
                            "w-full flex items-center gap-1",
                            header.column.getIsSorted() && 'text-primary',
                            header.column.columnDef.meta?.headerClassName?.includes('center') && 'justify-center',
                            header.column.columnDef.meta?.headerClassName?.includes('right') && 'justify-end'
                          )}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                          {enableSorting && header.column.getCanSort() && (
                            <span className="shrink-0 ml-1">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="size-3 md:size-4 text-primary" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="size-3 md:size-4 text-primary" />
                              ) : (
                                <ChevronsUpDown className="size-3 md:size-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-transparent">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'group transition-colors hover:bg-muted/50',
                        row.getIsSelected() && 'bg-success-bg/60 hover:bg-success-bg/80',
                        onRowClick && 'cursor-pointer',
                      )}
                      onClick={(e) => {
                        const target = e.target as HTMLElement
                        if (target.closest('input[type="checkbox"]')) return
                        if (target.closest('[data-col-id="select"]')) return
                        if (target.closest('[data-col-id="actions"]')) return
                        onRowClick?.(row)
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          data-col-id={cell.column.id}
                          className={cn(
                            "p-3 text-left align-middle border-b border-border-primary text-text-secondary group-last:border-0",
                            cell.column.columnDef.meta?.className
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center text-text-secondary"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {!isMobileExpanded && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-card via-card/80 to-transparent pointer-events-none sm:hidden" />
          )}
        </div>

        <div className="sm:hidden border-b border-border-primary bg-muted/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMobileExpanded(!isMobileExpanded)} 
            className="w-full rounded-none h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all flex items-center justify-center gap-2"
          >
            {isMobileExpanded ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                Collapse Columns
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                Scroll to See More Columns
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <Loaders size="md" />
        </div>
      )}

      {enablePagination && !isLoading && data.length > 0 && (
        <div className="flex flex-col gap-4 p-4 border-t border-border-primary bg-background sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xs text-text-secondary">
              Menampilkan{' '}
              <span className="font-semibold text-text-primary">
                {startRange} - {endRange}
              </span>{' '}
              dari{' '}
              <span className="font-semibold text-text-primary">
                {paginationInfo ? paginationInfo.total_element : data.length}
              </span>{' '}
              data
            </div>

            <div className="h-4 w-px bg-border-primary hidden sm:block" />

            <div className="flex items-center gap-2 border border-border-primary pl-3.5 rounded-md">
              <span className="text-xs text-text-secondary whitespace-nowrap">Show :</span>
              <NativeSelect
                value={String(statePageSize)}
                onChange={(e) => {
                  const newSize = Number(e.target.value)
                  table.setPageSize(newSize)
                  onPageSizeChange?.(newSize)
                }}
                className="w-fit h-fit cursor-pointer text-xs bg-transparent font-semibold border-none shadow-none focus:ring-0 px-2 py-1 outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <NativeSelectOption key={size} value={String(size)}>
                    {size}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <PaginationController
            currentPage={pageIndex + 1}
            totalPages={table.getPageCount() || 1}
            onPageChange={(page) => {
              if (onPageChange) {
                onPageChange(page - 1)
              } else {
                table.setPageIndex(page - 1)
              }
            }}
            maxVisible={5}
            className="w-auto mx-0"
          />
        </div>
      )}
    </div>
  )
}

Table.displayName = 'Table'
export { Table }
