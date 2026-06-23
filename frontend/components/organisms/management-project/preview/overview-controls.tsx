"use client"

import * as React from "react"
import { FilterBar } from "@/components/organisms"
import { DateRange } from "react-day-picker"

export type OverviewControlsProps = {
  search?: string
  onSearchChange?: (value: string) => void
  dateRange?: DateRange
  onDateChange?: (range: DateRange | undefined) => void
  filters?: { label: string; value: string }[]
  selectedFilter?: string
  onFilterChange?: (value: string) => void
  action?: React.ReactNode
}

export const OverviewControls = (props: OverviewControlsProps) => {
  return (
    <div >
      <FilterBar {...props} />
    </div>
  )
}
