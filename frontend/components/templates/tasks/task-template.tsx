"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { Plus, FolderX } from "lucide-react";

import { Id } from "@/convex/_generated/dataModel";

import { cn } from "@/lib";
import { useTaskProject } from "@/hooks";

import { 
  TaskBoard,
  TaskToolbar,
  TaskFormModal,
  TaskDetailSheet,
  TaskTimeline,
  TaskCalendar,
  TaskListContainer,
  ProjectOverviewDashboard,
  TaskCardProps
} from "@/components/organisms";
import { PageHeader, EmptyItem } from "@/components/molecules";
import { Button } from "@/components/atoms";


export interface TaskTemplateProps {
  projectId: Id<"projects">;
  className?: string;
}

export const TaskTemplate = ({
  projectId,
  className
}: TaskTemplateProps) => {
  const router = useRouter();

  const {
    tasks,
    isLoading,
    activeView,
    setActiveView,
    searchTerm,
    setSearchTerm,
    isCreateOpen,
    setIsCreateOpen,
    editingTask,
    defaultStatus,
    onFormSubmit,
    onAddTask,
    onEdit,
    onDelete,
    onArchive,
    onUnarchive,
    onBulkDelete,
    onBulkArchive,
    onBulkUnarchive,
    onBulkMove,
    onTaskPatch,
    project,
    members,
    onTaskUpdate,
    selectedTaskId,
    onSelectTask,
    onCloseDetail,
    showArchived,
    setShowArchived,
    filters,
    setFilters,
    onAddDailyLog,
    onViewDailyLog,
    selectedIds,
    toggleSelect,
    clearSelection,
    selectAllInGroup,
  } = useTaskProject(projectId);

  if (!isLoading && project === null) {
    return (
      <EmptyItem 
        title="Project Not Found"
        description="The project you are looking for does not exist or has been deleted or archived."
        actionLabel="Go back to Projects"
        onAction={() => router.push("/project")}
        icon={FolderX}
      />
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-20">
        <div className="w-full px-4 md:px-8 pt-4 md:pt-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <PageHeader 
                title="Tasks"
                description="Keep track of your team's tasks all in one place."
                className="px-0 pt-0 pb-6 bg-transparent border-b-0 static"
              >
                <Button onClick={() => onAddTask()} className="rounded-lg shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </PageHeader>
            </div>

            <div className="bg-card/30 p-1 rounded-xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <TaskToolbar 
                activeView={activeView}
                onViewChange={setActiveView}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFiltersChange={setFilters}
                showArchived={showArchived}
                onShowArchivedChange={setShowArchived}
              />
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="mx-auto w-full max-w-7xl">
          {activeView === "board" && (
            <TaskBoard 
              projectId={projectId}
              data={tasks}
              isLoading={isLoading}
              onTaskUpdate={onTaskUpdate}
              onAddTask={onAddTask}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onUpdate={onTaskPatch}
              selectedIds={selectedIds}
              onSelect={toggleSelect}
              onSelectAll={selectAllInGroup}
              onBulkDelete={(status) => {
                const ids = tasks.filter(t => t.status === status && selectedIds.has(t._id)).map(t => t._id);
                onBulkDelete?.(ids);
                clearSelection();
              }}
              onBulkArchive={(status) => {
                const ids = tasks
                  .filter(t => t.status === status && selectedIds.has(t._id) && !t.isArchived)
                  .map(t => t._id);
                onBulkArchive?.(ids);
                clearSelection();
              }}
              onBulkUnarchive={(status) => {
                const ids = tasks
                  .filter(t => t.status === status && selectedIds.has(t._id) && t.isArchived)
                  .map(t => t._id);
                onBulkUnarchive?.(ids);
                clearSelection();
              }}
              onBulkMove={(status, newStatus) => {
                const ids = tasks.filter(t => t.status === status && selectedIds.has(t._id)).map(t => t._id);
                onBulkMove?.(ids, newStatus);
                clearSelection();
              }}
              onClick={onSelectTask}
            />
          )}
          
          {activeView === "timeline" && (
            <TaskTimeline 
              projectId={projectId}
              tasks={tasks}
              isLoading={isLoading}
              onTaskChange={(task, start, end) => {
                onTaskUpdate(task._id, task.status, 0, start.getTime(), end.getTime());
              }}
              onTaskClick={onSelectTask}
            />
          )}

          {activeView === "list" && (
            <TaskListContainer 
              projectId={projectId}
              tasks={tasks}
              isLoading={isLoading}
              onStatusChange={(id, status, index) => onTaskUpdate(id, status, index)}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onBulkDelete={onBulkDelete}
              onBulkArchive={onBulkArchive}
              onBulkUnarchive={onBulkUnarchive}
              onBulkMove={onBulkMove}
              onAddTask={onAddTask}
              onQuickAdd={(title, status) => {
                onFormSubmit({ 
                  title, 
                  status, 
                  type: "TASK",
                  priority: "MEDIUM",
                  scoreValue: 0
                });
              }}
              onUpdate={onTaskPatch}
              onTaskClick={onSelectTask}
              selectedIds={selectedIds}
              onSelect={toggleSelect}
              onSelectAll={selectAllInGroup}
            />
          )}

          {activeView === "calendar" && (
            <TaskCalendar 
              projectId={projectId}
              onAddLog={onAddDailyLog}
              onViewDailyLog={onViewDailyLog}
            />
          )}

          {activeView === "overview" && (
            <ProjectOverviewDashboard 
              projectId={projectId} 
              onSelectTask={onSelectTask}
            />
          )}
          </div>
        </div>
      </main>

      <TaskFormModal 
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={onFormSubmit}
        initialStatus={defaultStatus}
        initialData={editingTask || undefined}
        members={members || []}
      />

      <TaskDetailSheet 
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={onCloseDetail}
        onEdit={(task) => {
          onCloseDetail();
          onEdit(task as TaskCardProps);
        }}
      />
    </div>
  );
};
