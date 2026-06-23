'use client'
import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button
} from "@/components/atoms"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/molecules"
import { cn } from "@/lib/utils"

type ChartCardProps = {
  title: string
  children: React.ReactNode 
  actions?: React.ReactNode 
  filterOptions?: string[]
  activeFilter?: string
  defaultFilter?: string
  onFilterChange?: (filter: string) => void
  legend?: React.ReactNode
  className?: string
}

export const ChartCard = ({
  title,
  children,
  actions,
  filterOptions,
  activeFilter: activeFilterProp,
  defaultFilter,
  onFilterChange,
  legend,
  className,
}: ChartCardProps) => {
  const [internalFilter, setInternalFilter] = useState(defaultFilter ?? filterOptions?.[0] ?? "")
  const activeFilter = activeFilterProp ?? internalFilter

  const handleFilterSelect = (item: string) => {
    setInternalFilter(item)
    onFilterChange?.(item)
  }

  return (
    <Card className={cn("rounded-2xl shadow-sm flex flex-col", className)}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4 sm:gap-0">
        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {filterOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {activeFilter || "Filter"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {filterOptions.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onClick={() => handleFilterSelect(item)}
                    className={cn(activeFilter === item && "font-semibold text-primary")}
                  >
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {actions}
        </div>
      </CardHeader>

      {legend && (
        <div className="px-6 pb-2 shrink-0">
          {legend}
        </div>
      )}
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="px-6 pt-2 pb-0">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
