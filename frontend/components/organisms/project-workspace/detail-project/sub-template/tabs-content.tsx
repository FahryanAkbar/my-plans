"use client";

import { ProjectMembersSection } from "../project-members-section";
import { ProjectSettingsTab } from "../project-settings-tab";
import { ProjectTab } from "../project-detail-tabs";
import { Member } from "../project-members-section";
import { InvitationList } from "../../invitation";
import { Typography } from "@/components/atoms";
import { ProjectQuickStats } from "./quick-stats";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { InviteMemberPayload, InviteMembersResult } from '@/types/features'
import { cn } from "@/lib";

interface TabContentProps {
  activeTab: ProjectTab;
  project: Doc<"projects">;
  members: Member[];
  currentMember?: { userId: string; role: string; position: string } | null;
  invitations: Doc<"projectInvitations">[];
  canManageMembers: boolean;
  quickStats: { label: string; value: string | number; subValue?: string }[];
  projectIdentityFields: { label: string; value: string }[];
  projectTimelineFields: { label: string; value: string }[];
  inviteLink: string;
  pendingInvitesCount: number;
  getMemberName: (userId?: string) => string;
  onInviteMembers: (invites: InviteMemberPayload[]) => Promise<InviteMembersResult> | void;
  onCancelInvitation: (id: Id<"projectInvitations">) => Promise<void> | void;
  onRemoveMember: (userId: string) => Promise<void> | void;
  onUpdateMember: (memberUserId: string, updates: { role?: string, position?: string }) => Promise<void> | void;
}

export const ProjectTabsContent = ({
  activeTab,
  project,
  members,
  currentMember,
  invitations,
  canManageMembers,
  quickStats,
  projectTimelineFields,
  inviteLink,
  pendingInvitesCount,
  getMemberName,
  onInviteMembers,
  onCancelInvitation,
  onRemoveMember,
  onUpdateMember,
}: TabContentProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8">
          <ProjectQuickStats stats={quickStats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Timeline & Configuration */}
            <div className="lg:col-span-1 flex flex-col gap-6 h-full">
              {/* Timeline Grid */}
              <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col divide-y divide-border/40">
                <div className="px-6 py-4 bg-muted/5">
                  <Typography className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Timeline</Typography>
                </div>
                <div className="flex flex-col divide-y divide-border/40">
                  <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="px-6 py-5 flex flex-col gap-1.5 hover:bg-muted/5 transition-colors">
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Start date</span>
                      <span className="text-sm font-semibold text-foreground/80">{projectTimelineFields.find(f => f.label === 'Start Date')?.value}</span>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-1.5 hover:bg-muted/5 transition-colors">
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">End date</span>
                      <span className="text-sm font-semibold text-foreground/80">{projectTimelineFields.find(f => f.label === 'End Date')?.value}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="px-6 py-5 flex flex-col gap-1.5 hover:bg-muted/5 transition-colors">
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Created</span>
                      <span className="text-sm font-semibold text-foreground/80">{projectTimelineFields.find(f => f.label === 'Created')?.value}</span>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-1.5 hover:bg-muted/5 transition-colors">
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Last updated</span>
                      <span className="text-sm font-semibold text-foreground/80">{projectTimelineFields.find(f => f.label === 'Last Updated')?.value}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3.5 bg-muted/5 flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground/60 font-medium">Last edited by</span>
                  <span className="font-semibold text-foreground/70">{getMemberName(project.lastEditedBy)}</span>
                </div>
              </div>

              {/* Configuration Grid */}
              <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col divide-y divide-border/40">
                <div className="px-6 py-4 bg-muted/5">
                  <Typography className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Configuration</Typography>
                </div>
                <div className="flex flex-col divide-y divide-border/40">
                  <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="px-6 py-5 flex flex-col gap-2.5 hover:bg-muted/5 transition-colors bg-card">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Collaborative</span>
                      <span className={cn(
                        "w-fit px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                        project.isCollaborative ? "bg-emerald-500/10 text-emerald-600/80 border border-emerald-500/20" : "bg-muted/50 text-muted-foreground/80 border border-border/50"
                      )}>
                        {project.isCollaborative ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-2.5 hover:bg-muted/5 transition-colors bg-card">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Archived</span>
                      <span className={cn(
                        "w-fit px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                        project.isArchived ? "bg-amber-500/10 text-amber-600/80 border border-amber-500/20" : "bg-muted/50 text-muted-foreground/80 border border-border/50"
                      )}>
                        {project.isArchived ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="px-6 py-5 flex flex-col gap-2.5 hover:bg-muted/5 transition-colors bg-card">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Visibility</span>
                      <span className="w-fit px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600/80 border border-blue-500/20">
                        {project.isCollaborative ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-2.5 hover:bg-muted/5 transition-colors bg-card">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Platform</span>
                      <span className="w-fit px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted/50 text-muted-foreground/70 border border-border/50">
                        {project.platform || "Web"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 h-full">
              <ProjectMembersSection
                title="Project Team"
                members={members}
                currentUserId={currentMember?.userId}
                managerId={project.managerId}
                canManageMembers={canManageMembers}
                onRemoveMember={onRemoveMember}
                onUpdateMember={onUpdateMember}
                inviteLink={inviteLink}
                onInviteMembers={onInviteMembers}
                inviteMaxUses={project.inviteMaxUses}
                inviteUseCount={project.inviteUseCount}
                defaultJoinRole={project.defaultJoinRole}
                defaultJoinPosition={project.defaultJoinPosition}
                projectId={project._id}
                className="border bg-card border-border/50 shadow-sm h-full rounded-xl overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <ProjectMembersSection
              title="Team Management"
              members={members}
              currentUserId={currentMember?.userId}
              managerId={project.managerId}
              canManageMembers={canManageMembers}
              onRemoveMember={onRemoveMember}
              onUpdateMember={onUpdateMember}
              inviteLink={inviteLink}
              onInviteMembers={onInviteMembers}
              inviteMaxUses={project.inviteMaxUses}
              inviteUseCount={project.inviteUseCount}
              defaultJoinRole={project.defaultJoinRole}
              defaultJoinPosition={project.defaultJoinPosition}
              projectId={project._id}
              className="bg-card border shadow-sm"
            />

            {canManageMembers && (
              <InvitationList
                invitations={invitations || []}
                onCancel={(id) => onCancelInvitation(id as Id<"projectInvitations">)}
              />
            )}
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Team Stats</span>
              </div>
              <div className="flex flex-col divide-y divide-border/40">
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">Total members</span>
                  <span className="text-sm font-semibold text-foreground/80">{members.length}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">Pending invites</span>
                  <span className="text-sm font-semibold text-foreground/80">{pendingInvitesCount}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">Total invitations</span>
                  <span className="text-sm font-semibold text-foreground/80">{invitations.length}</span>
                </div>
              </div>
            </div>
            
            {members.length > 0 && (() => {
              const roleCounts = members.reduce<Record<string, number>>((acc, m) => {
                acc[m.role] = (acc[m.role] ?? 0) + 1;
                return acc;
              }, {});
              const roleColors: Record<string, string> = {
                PIC: "bg-zinc-400",
                Owner: "bg-zinc-400",
                Member: "bg-emerald-400",
                QA: "bg-amber-400",
                FE: "bg-blue-400",
                BE: "bg-violet-400",
              };
              return (
                <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/40">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Roles</span>
                  </div>
                  <div className="flex flex-col divide-y divide-border/40">
                    {Object.entries(roleCounts).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", roleColors[role] ?? "bg-muted-foreground/40")} />
                          <span className="text-sm text-muted-foreground">{role === "PIC" ? "Owner" : role}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground/80">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <ProjectSettingsTab project={project} />
          </div>
        </div>
      )}
    </div>
  );
};
