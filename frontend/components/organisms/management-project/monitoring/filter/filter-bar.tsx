'use client'

import * as React from 'react'
import { cn } from '@/lib'
import { 
  Button
} from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/molecules'
import { 
  SearchInput,
  DateRangePicker
 } from '@/components/organisms'

import { DateRange } from "react-day-picker"
import { SlidersHorizontal } from "lucide-react"

type FilterOptions = {
  label: string
  value: string
}

type FilterBarProps = {
  search?: string
  onSearchChange?: (value: string) => void
  dateRange?: DateRange
  onDateChange?: (range: DateRange | undefined) => void
  filters?: FilterOptions[]
  selectedFilter?: string
  onFilterChange?: (value: string) => void
  action?: React.ReactNode
  className?: string
}

export const FilterBar = ({
  search,
  onSearchChange,
  dateRange,
  onDateChange,
  filters,
  selectedFilter,
  onFilterChange,
  action,
  className,
}: FilterBarProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        <div className="w-full md:max-w-60">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            shortcut="Ctrl K"
          />
        </div>

        <DateRangePicker
          value={dateRange}
          onChange={onDateChange}
        />

        {filters && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {selectedFilter || "Filter"}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              {filters.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onClick={() => onFilterChange?.(item.value)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {action && (
        <div className="flex justify-end">
          {action}
        </div>
      )}
    </div>
  )
}
