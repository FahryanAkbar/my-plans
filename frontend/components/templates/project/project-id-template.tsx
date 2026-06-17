"use client";

import { Id } from "@/convex/_generated/dataModel";
import { cn, type ProjectStatus } from "@/lib";
import { useProjectIdTemplate } from "@/hooks";
import {
  ProjectDetailHeader,
  ProjectDetailTabs,
  ProjectCover,
  ProjectTabsContent,
  ProjectDetailSkeleton,
  ProjectNotFound,
} from "@/components/organisms";

export interface ProjectIdTemplateProps {
  projectId: Id<"projects">;
  className?: string;
}

export const ProjectIdTemplate = ({
  projectId,
  className,
}: ProjectIdTemplateProps) => {
  const {
    activeTab,
    setActiveTab,
    project,
    members,
    invitations,
    currentMember,
    inviteLink,
    onInviteMembers,
    onCancelInvitation,
    handleRemoveMember,
    handleUpdateMember,
    onUpdate,
    getMemberName,
    isLoading,
    canManageMembers,
    canLeaveProject,
    handleLeaveProject,
    pendingInvitesCount,
    quickStats,
    projectIdentityFields,
    projectTimelineFields,
    handleIconChange,
    handleRemoveIcon,
  } = useProjectIdTemplate(projectId);

  if (isLoading) {
    return <ProjectDetailSkeleton className={className} />;
  }

  if (!project || !members) {
    return <ProjectNotFound />;
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <main className="w-full flex-1 overflow-y-auto">
        <ProjectCover 
          name={project.name} 
          projectImage={project.projectImage} 
          icon={project.icon}
          onIconChange={canManageMembers ? handleIconChange : undefined}
          onRemoveIcon={canManageMembers ? handleRemoveIcon : undefined}
          onLeave={canLeaveProject ? handleLeaveProject : undefined}
          onUpdate={canManageMembers ? onUpdate : undefined}
        />

        <div className="px-4 md:px-8 relative z-10 pb-16">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            <ProjectDetailHeader
              title={project.name}
              icon={project.icon}
              description={project.description}
              status={project.status as ProjectStatus}
              className="text-foreground"
            />

            <ProjectDetailTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              canManageMembers={canManageMembers}
            />

            <ProjectTabsContent 
              activeTab={activeTab}
              project={project}
              members={members}
              currentMember={currentMember}
              invitations={invitations || []}
              canManageMembers={canManageMembers}
              quickStats={quickStats}
              projectIdentityFields={projectIdentityFields}
              projectTimelineFields={projectTimelineFields}
              inviteLink={inviteLink}
              pendingInvitesCount={pendingInvitesCount}
              getMemberName={getMemberName}
              onInviteMembers={async (invites) => onInviteMembers(invites)}
              onCancelInvitation={async (id) => { await onCancelInvitation(id); }}
              onRemoveMember={handleRemoveMember}
              onUpdateMember={handleUpdateMember}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
