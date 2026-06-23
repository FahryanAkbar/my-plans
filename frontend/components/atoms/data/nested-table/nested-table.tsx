'use client'

import React, { useMemo, useState } from 'react'

import {
  ColumnDef,
  RowSelectionState,
  SortingState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, Search } from 'lucide-react'

import { Button, Checkbox, Typography } from '@/components/atoms'
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

export interface NestedTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  depth?: number
  maxDepth?: number
  getSubRows?: (row: TData) => TData[] | undefined
  enableRowSelection?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  pageSize?: number
  onRowSelectionChange?: (selection: RowSelectionState) => void
  emptyMessage?: string
  title?: string
  className?: string
  getRowClassName?: (row: TData, depth: number) => string
  externalFilterValue?: string
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

export function NestedTable<TData extends { id: string }>({
  data,
  columns,
  depth = 0,
  maxDepth = 3,
  getSubRows,
  enableRowSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  pageSize = 5,
  onRowSelectionChange,
  emptyMessage = 'No data available',
  title,
  className,
  getRowClassName,
  externalFilterValue,
}: NestedTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Synchronize external filter
  React.useEffect(() => {
    if (externalFilterValue !== undefined) {
      setGlobalFilter(externalFilterValue)
    }
  }, [externalFilterValue])

  // Memoize columns to include selection and expander if needed
  const tableColumns = useMemo(() => {
    const cols = [...columns]

    // Expander column - ALWAYS added to maintain alignment across levels
    if (depth < maxDepth) {
      cols.unshift({
        id: 'expander',
        header: () => <div className="w-8" />,
        cell: ({ row }) => {
          const subData = getSubRows?.(row.original)
          const hasChildren = subData && subData.length > 0

          if (!hasChildren) return <div className="w-8 text-center" />

          const isExpanded = expandedRows[row.id]
          return (
            <div className="flex justify-center w-8" style={{ marginLeft: `${depth * 12}px` }}>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100/50 rounded transition-colors border-none shadow-none"
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-text-secondary" />
                ) : (
                  <ChevronRight size={16} className="text-text-secondary" />
                )}
              </Button>
            </div>
          )
        },
        size: 80, 
      })
    }

    if (enableRowSelection) {
      if (depth === 0) {
        cols.unshift({
          id: 'selection',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) => row.toggleSelected(!!checked)}
              aria-label="Select row"
            />
          ),
          size: 40,
        })
      } else {
        cols.unshift({
          id: 'selection',
          header: '',
          cell: () => <div className="w-10" />,
          size: 40,
        })
      }
    }

    return cols
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, depth, maxDepth, data, getSubRows, enableRowSelection, expandedRows])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater)
      const nextSelection = functionalUpdate(updater, rowSelection)
      onRowSelectionChange?.(nextSelection)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {title && depth === 0 && (
        <Typography variant="h4" className="mb-4 text-lg font-bold">
          {title}
        </Typography>
      )}

      <div
        className={cn(
          depth === 0
            ? 'rounded-xl border border-border-primary bg-white shadow-sm overflow-hidden'
            : 'bg-transparent',
        )}
      >
        {enableFiltering && depth === 0 && externalFilterValue === undefined && (
          <div className="p-4 border-b border-border-primary flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search level..."
                className="flex h-9 w-full rounded-lg border border-border-primary bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        )}

        <div className={cn('overflow-x-auto', depth > 0 && 'overflow-visible')}>
          <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
            {depth === 0 && (
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-12 px-4 text-left align-middle font-bold text-text-primary border-b-2 border-border-primary whitespace-nowrap uppercase text-xs tracking-wide"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              'flex items-center gap-2 group',
                              header.column.getCanSort() && 'cursor-pointer select-none',
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {enableSorting && header.column.getCanSort() && (
                              <span className="shrink-0">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ChevronUp className="size-4 text-primary" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ChevronDown className="size-4 text-primary" />
                                ) : (
                                  <ChevronsUpDown className="size-4 text-text-secondary opacity-0 group-hover:opacity-100" />
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
            )}
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={cn(
                        'group transition-colors hover:bg-gray-50/50',
                        row.getIsSelected() && 'bg-success-bg/30',
                        getRowClassName?.(row.original, depth),
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <td
                          key={cell.id}
                          className={cn(
                            'px-4 py-3 align-middle border-b border-border-primary/50 text-text-primary',
                            cell.column.id === 'selection' || cell.column.id === 'expander'
                              ? 'w-10'
                              : '',
                          )}
                          style={{
                            width: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                          }}
                        >
                          <div
                            className={cn(
                              'flex items-center relative',
                              cell.column.id === 'selection' || cell.column.id === 'expander'
                                ? 'justify-center'
                                : '',
                            )}
                            style={{
                              paddingLeft:
                                cellIndex ===
                                  (enableRowSelection ? 1 : 0) + (depth < maxDepth ? 1 : 0) &&
                                depth > 0
                                  ? `${depth * 28}px`
                                  : '0px',
                            }}
                          >
                            {/* Indentation guide lines (Text editor style) */}
                            {depth > 0 &&
                              cellIndex ===
                                (enableRowSelection ? 1 : 0) + (depth < maxDepth ? 1 : 0) && (
                                <div
                                  className="absolute left-0 top-[-24px] bottom-[-24px] flex pointer-events-none"
                                  style={{ left: '0px' }}
                                >
                                  {Array.from({ length: depth }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="h-full border-l border-black/[0.06]"
                                      style={{
                                        marginLeft: i === 0 ? '0px' : '28px',
                                        width: '1px',
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                    {expandedRows[row.id] && getSubRows?.(row.original) && (
                      <tr>
                        <td colSpan={tableColumns.length} className="p-0">
                          <NestedTable
                            data={getSubRows(row.original)!}
                            columns={columns}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                            getSubRows={getSubRows}
                            enableRowSelection={enableRowSelection}
                            enableSorting={enableSorting}
                            enableFiltering={false}
                            enablePagination={false}
                            pageSize={pageSize}
                            emptyMessage={emptyMessage}
                            getRowClassName={getRowClassName}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    className="h-24 text-center text-text-secondary italic"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {enablePagination && table.getPageCount() > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border-primary bg-white">
            <div className="text-xs text-text-secondary">
              Page{' '}
              <span className="font-semibold text-text-primary">
                {table.getState().pagination.pageIndex + 1}
              </span>{' '}
              of <span className="font-semibold text-text-primary">{table.getPageCount()}</span>
            </div>
            <PaginationController
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(page: number) => table.setPageIndex(page - 1)}
              maxVisible={3}
              className="w-auto mx-0"
            />
          </div>
        )}
      </div>
    </div>
  )
}
