"use client";

import * as React from "react";
import { cn, PROJECT_HEADER } from "@/lib";
import { useProjectTemplate } from "@/hooks";
import {
  ProjectHeader,
  ProjectToolbar,
  ProjectTable,
  ProjectHeaderProps,
  CreateProjectModal,
  ProjectRowProps
} from "@/components/organisms";

export interface ProjectTemplateProps {
  header?: ProjectHeaderProps;
  className?: string;
}

export const ProjectTemplate = ({
  header,
  className,
}: ProjectTemplateProps) => {
  const {
    isCreateOpen,
    setIsCreateOpen,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    table,
    isLoading,
    counts,
  } = useProjectTemplate();

  const headerData = header ?? PROJECT_HEADER;

  const projectTabs = [
    { 
      label: "All projects", 
      value: "all", 
      count: counts?.all 
    },
    { 
      label: "Archived", 
      value: "archived", 
      count: counts?.archived 
    },
  ];

  const statusOptions = [
    { label: "All Status", value: "all", count: counts?.all },
    { label: "Planning", value: "Planning", count: counts?.Planning, color: "bg-slate-400" },
    { label: "In Track", value: "In-Progress", count: counts?.["In-Progress"], color: "bg-amber-500" },
    { label: "At Risk", value: "At Risk", count: counts?.["At Risk"], color: "bg-purple-500" },
    { label: "Late", value: "Late", count: counts?.Late, color: "bg-red-500" },
    { label: "Completed", value: "Completed", count: counts?.Completed, color: "bg-green-500" },
  ];

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-20">
        <div className="w-full px-4 md:px-8 pt-4 md:pt-8">
          <div className="mx-auto w-full max-w-7xl space-y-10">
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <ProjectHeader
                {...headerData}
                onActionClick={() => setIsCreateOpen(true)}
              />
            </div>
           
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <ProjectToolbar<ProjectRowProps>
                tabs={projectTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchTerm={table.searchTerm}
                onSearchChange={table.setSearchTerm}
                sortConfig={table.sortConfig}
                onSortChange={table.handleSort}
                sortOptions={[
                  { label: "Project Name", key: "name" },
                  { label: "Status", key: "status" },
                  { label: "Progress", key: "progress" },
                ]}
                activeFilter={statusFilter}
                onFilterClick={setStatusFilter}
                onClearFilters={() => {
                  table.setSearchTerm("");
                  setStatusFilter("all");
                }}
                filterOptions={activeTab === "all" ? statusOptions : []}
              />
             
              <ProjectTable
                data={table.data}
                isLoading={isLoading}
                totalItems={table.totalItems}
                startIndex={table.startIndex}
                endIndex={table.endIndex}
                totalPages={table.totalPages}
                currentPage={table.currentPage}
                limit={table.limit}
                onLimitChange={(val) => {
                  table.setLimit(val);
                  table.setCurrentPage(1);
                }}
                isFirstPage={table.isFirstPage}
                isLastPage={table.isLastPage}
                onPageChange={table.setCurrentPage}
                isEmpty={table.isEmpty}
                searchTerm={table.searchTerm}
              />
            </div>
          </div>
        </div>
      </main>

      <CreateProjectModal
        open={isCreateOpen}
        onOpenChange={() => setIsCreateOpen(false)}
      />
    </div>
  );
};