"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { cn } from "@/lib";
import { useIssueTemplate } from "@/hooks";

import { 
  IssueBoard, 
  IssueFormModal,
  IssueDetailSheet,
  IssueToolbar,
  IssueActivityList,
  IssueActivityToolbar,
  ScoreHistory,
  IssuesEmpty
} from "@/components/organisms";
import { Button, Loaders } from "@/components/atoms";
import { PageHeader, ConfirmModal } from "@/components/molecules";

export interface IssuesTemplateProps {
  projectId: Id<"projects">;
  className?: string;
}

export const IssuesTemplate = ({
  projectId,
  className
}: IssuesTemplateProps) => {
  const {
    issues,
    isLoading,
    isCreateOpen,
    initialStatus,
    editingIssue,
    selectedIds,
    isDetailOpen,
    detailIssueId,
    onOpenDetail,
    onCloseDetail,
    onOpenCreate,
    onCreateSubmit,
    onStatusChange,
    onUpdateIssue,
    onEditIssue,
    onSelect,
    onSelectAll,
    onBulkDelete,
    onBulkStatusUpdate,
    onBulkArchive,
    setIsCreateOpen,
    project,
    members,
    deletingIssueId,
    setDeletingIssueId,
    handleDeleteConfirm,
    onEditFromDetail,
    activeView,
    setActiveView,
    searchTerm,
    setSearchTerm,
    activitySearch,
    setActivitySearch,
    selectedActions,
    setSelectedActions,
    selectedMemberId,
    setSelectedMemberId,
    selectedPeriod,
    setSelectedPeriod,
    selectedFilters,
    setSelectedFilters,
    showArchived,
    onToggleArchived
  } = useIssueTemplate(projectId);

  const [activityStats, setActivityStats] = React.useState({ total: 0, filtered: 0 });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background/50 backdrop-blur-sm animate-in fade-in duration-500">
        <Loaders size="lg" />
      </div>
    );
  }

  if (project === null) {
    return <IssuesEmpty />;
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-20">
        <div className="w-full px-4 md:px-8 pt-4 md:pt-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <header className="animate-in fade-in slide-in-from-top-4 duration-500">
              <PageHeader 
                title="Issue Tracker"
                description="Manage and track bugs, improvements, and technical issues."
                className="px-0 pt-0 pb-6 bg-transparent border-b-0 static"
              >
                <Button variant="default" onClick={() => onOpenCreate()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </PageHeader>
            </header>

            <div className="bg-card/30 p-1 rounded-xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <IssueToolbar 
                activeView={activeView}
                onViewChange={setActiveView}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showArchived={showArchived}
                onToggleArchived={onToggleArchived}
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="mx-auto w-full max-w-7xl">

            {activeView === "board" && (
              <IssueBoard 
                issues={issues || []}
                isLoading={isLoading}
                onStatusChange={onStatusChange}
                onAddIssue={onOpenCreate}
                onEdit={onEditIssue}
                onDelete={(id) => setDeletingIssueId(id as Id<"issues">)}
                onIssueClick={(id) => onOpenDetail(id as Id<"issues">)}
                onSelect={onSelect}
                onSelectAll={onSelectAll}
                selectedIds={selectedIds}
                onBulkDelete={onBulkDelete}
                onBulkStatusUpdate={onBulkStatusUpdate}
                onBulkArchive={onBulkArchive}
                onUpdate={onUpdateIssue}
              />
            )}

            {activeView === "list" && (
              <ScoreHistory projectId={projectId} />
            )}

            {activeView === "activity" && (
              <div className="flex flex-col gap-6 pb-10">
                <div className="bg-card/20 p-4 rounded-2xl border border-border/40 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                  <IssueActivityToolbar 
                    search={activitySearch}
                    onSearchChange={setActivitySearch}
                    selectedActions={selectedActions}
                    onActionsChange={setSelectedActions}
                    selectedMemberId={selectedMemberId}
                    onMemberChange={setSelectedMemberId}
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                    members={members || []}
                    totalCount={activityStats.total}
                    filteredCount={activityStats.filtered}
                  />
                </div>
                
                <IssueActivityList 
                  projectId={projectId} 
                  search={activitySearch}
                  selectedActions={selectedActions}
                  selectedMemberId={selectedMemberId}
                  selectedPeriod={selectedPeriod}
                  onStatsUpdate={setActivityStats}
                />
              </div>
            )}

          </div>
        </div>

      </main>

      <IssueFormModal 
        projectId={projectId}
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={onCreateSubmit}
        initialStatus={initialStatus}
        initialData={editingIssue || undefined}
        members={members || []}
      />

      <IssueDetailSheet 
        issueId={detailIssueId}
        isOpen={isDetailOpen}
        onClose={onCloseDetail}
        onEdit={onEditFromDetail}
      />

      <ConfirmModal 
        open={!!deletingIssueId}
        onOpenChange={(open) => !open && setDeletingIssueId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Issue"
        description=
          "Are you sure you want to delete this issue? This action cannot be undone and all related activity logs will be removed."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};
