"use client";

import * as React from "react";
import { cn } from "@/lib";
import { useManagementProjectTemplate } from "@/hooks";
import {
  OverviewHeader, 
  OverviewHeaderProps,
  OverviewControls, 
  OverviewControlsProps,
  OverviewStats, 
  OverviewChart, 
  OverviewTasks, 
  TaskData,
  OverviewProjectTracker,
  ProjectRowProps,
  SystemStatusPanel,
} from "@/components/organisms";
import { Id } from "@/convex/_generated/dataModel";

interface ManagementProjectTemplateProps {
  header?: OverviewHeaderProps;
  controls?: OverviewControlsProps;
  projectId?: Id<"projects">
  tasks?: TaskData[];
  projects?: ProjectRowProps[];
}

export const ManagementProjectTemplate = ({
  projectId,
  header,
  controls,
  tasks,
  projects,
}: ManagementProjectTemplateProps) => {
  const {
    search,
    dateRange,
    filteredProjects,
    members,
    handleSearchChange,
    handleDateChange,
  } = useManagementProjectTemplate({
    projectId,
    header,
    controls,
    projects,
  });

  return (
    <div className={cn("h-full flex flex-col")}>
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-20">
        <div className="w-full px-4 md:px-8 pt-4 md:pt-8">
          <div className="mx-auto w-full max-w-7xl space-y-8">
            <OverviewHeader
              {...header}
              members={members}
              controls={
                <OverviewControls
                  {...controls}
                  search={search}
                  onSearchChange={handleSearchChange}
                  dateRange={dateRange}
                  onDateChange={handleDateChange}
                />
              }
            />

            <SystemStatusPanel />
            
            <OverviewStats projectId={projectId} />
            
            <OverviewProjectTracker projects={filteredProjects} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
              <div className="xl:col-span-2 flex min-w-0">
                <OverviewChart projectId={projectId} className="h-full w-full" />
              </div>
              <div className="xl:col-span-1 flex min-w-0">
                <OverviewTasks tasks={tasks} projectId={projectId} className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
