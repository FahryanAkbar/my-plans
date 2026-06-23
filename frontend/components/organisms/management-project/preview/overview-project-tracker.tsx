"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { Search } from "lucide-react"

import { Card, CardContent, Input } from "@/components/atoms"
import { api } from "@/convex/_generated/api"
import { useTableManagement, useDebounce } from "@/hooks"
import { ProjectTable } from "../project/project-table"
import { ProjectRowProps } from "../monitoring/project-shared"

export type OverviewProjectTrackerProps = {
  projects?: ProjectRowProps[]
  isLoading?: boolean
}

export const OverviewProjectTracker = ({
  projects: projectsProp,
  isLoading: isLoadingProp = false,
}: OverviewProjectTrackerProps) => {
  const projects = useQuery(api.project.get, {})

  const rawData = React.useMemo(() => {
    return (projectsProp || (projects as ProjectRowProps[] | undefined) || []) as ProjectRowProps[]
  }, [projectsProp, projects])

  const {
    data: managedData,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    startIndex,
    endIndex,
    totalPages,
    isFirstPage,
    isLastPage,
    isEmpty,
  } = useTableManagement({
    initialData: rawData,
    searchFields: ["name", "description", "status", "platform"],
    defaultPageSize: 5,
  })

  const [searchInput, setSearchInput] = React.useState(searchTerm)
  const debouncedSearch = useDebounce(searchInput, 500)

  React.useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  React.useEffect(() => {
    setSearchTerm(debouncedSearch)
  }, [debouncedSearch, setSearchTerm])

  const isLoading = isLoadingProp || projects === undefined

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchInput}
                maxLength={20}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 rounded-lg border-border/50 bg-muted/20"
              />
            </div>
          </div>

          <ProjectTable
            data={managedData}
            isLoading={isLoading}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            totalPages={totalPages}
            currentPage={currentPage}
            limit={pageSize}
            onLimitChange={setPageSize}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
            onPageChange={setCurrentPage}
            isEmpty={isEmpty}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>
    </div>
  )
}
