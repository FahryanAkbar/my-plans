"use client";

import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useDailyLogs } from "@/hooks";
import { 
  DailyLogNavbar,
  DailyLogEditorContainer, 
  DailyLogSidebar,
  DailyLogEmptyState,
  DailyLogDocumentHeader
} from "@/components/organisms";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Button
} from "@/components/atoms";
import { Calendar as CalendarIcon } from "lucide-react";

interface DailyLogsTemplateProps {
  projectId: Id<"projects">;
  dateStr: string;
}

export const DailyLogsTemplate = ({
  projectId,
  dateStr
}: DailyLogsTemplateProps) => {
  const {
    date,
    log,
    title,
    members,
    activeMembers,
    isLoading,
    onSave,
    onChange,
    onBack,
    onSearch,
    onTitleChange,
    onDateChange,
    onInitialize,
    content,
    searchResults,
    hasLog,
  } = useDailyLogs({ projectId, dateStr });

  const project = useQuery(api.project.getProjectById, { projectId });
  const smartBreadcrumbs = [
    { label: "Home", href: "/monitoring" },
    { label: "Projects", href: "/monitoring" },
    { label: project?.name || "Project", href: `/project/${projectId}` },
    { label: "Daily Logs", href: `/project/${projectId}` },
    { label: format(date, "dd MMM yyyy"), href: "#" },
  ];

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <DailyLogNavbar 
        members={members}
        onSearch={onSearch}
        searchResults={searchResults}
        onResultClick={onDateChange}
        breadcrumbs={smartBreadcrumbs}
        onBack={onBack}
        className="shrink-0"
        rightActions={
          <div className="lg:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[85vh] p-0 overflow-hidden">
                <div className="overflow-y-auto h-full scrollbar-hide">
                  <DailyLogSidebar 
                    projectId={projectId}
                    selectedDate={date}
                    onDateChange={(d) => {
                      onDateChange(d);
                    }}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        }
      />


      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
            <DailyLogDocumentHeader 
              title={title}
              onTitleChange={onTitleChange}
              isLoading={isLoading}
              lastSynced={log?.updatedAt}
              activeMembers={activeMembers}
              onBack={onBack}
              onSave={onSave}
            />

            {hasLog ? (
              <DailyLogEditorContainer 
                isLoading={isLoading}
                logId={log?._id}
                initialContent={content}
                onChange={onChange}
              />
            ) : (
              <DailyLogEmptyState 
                date={date}
                onStart={onInitialize}
              />
            )}
          </div>
        </main>

        <aside className="hidden lg:flex w-80 border-l border-border/50 bg-muted/5 flex-col shrink-0 overflow-y-auto scrollbar-hide">
          <DailyLogSidebar 
            projectId={projectId}
            selectedDate={date}
            onDateChange={onDateChange}
          />
        </aside>

      </div>
    </div>
  );
};
