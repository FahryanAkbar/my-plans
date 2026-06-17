'use client'

import * as React from 'react'
import { ChevronDown, UserPlus, X } from 'lucide-react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardAction,
  Button,
  Typography,
  Separator
} from '@/components/atoms'
import { 
  ConfirmModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/molecules'
import { AvatarWithInfo } from '@/components/organisms'
import { InviteMembersDialog } from '../invitation'

import { cn } from '@/lib'
import { ROLES, USER_POSITION } from '@/lib/constants'
import { InviteMemberPayload, InviteMembersResult } from '@/types/features'

export interface Member {
  userId: string
  fullName: string
  imageUrl?: string
  role: string
  position?: string
}

export interface ProjectMembersSectionProps {
  title: string
  action?: React.ReactNode
  onInviteClick?: () => void
  onInviteMembers?: (members: InviteMemberPayload[]) => Promise<InviteMembersResult> | void
  inviteLink?: string
  inviteMaxUses?: number | null
  inviteUseCount?: number
  onUpdateMaxUses?: (maxUses: number | null | undefined, silent?: boolean) => Promise<void> | void
  defaultJoinRole?: string
  defaultJoinPosition?: string
  inviteDialogTitle?: string
  inviteDialogDescription?: string
  inviteDomainHint?: string
  members: Member[]
  currentUserId?: string
  managerId?: string
  canManageMembers?: boolean
  onRemoveMember?: (memberUserId: string) => Promise<void> | void
  onUpdateMember?: (memberUserId: string, updates: { role?: string, position?: string }) => Promise<void> | void
  projectId?: string
  className?: string
}

export const ProjectMembersSection = ({
  title,
  action,
  onInviteClick,
  onInviteMembers,
  inviteLink,
  inviteDialogTitle,
  inviteDialogDescription,
  inviteDomainHint,
  members,
  currentUserId,
  managerId,
  canManageMembers = false,
  onRemoveMember,
  onUpdateMember,
  projectId,
  inviteMaxUses,
  inviteUseCount,
  onUpdateMaxUses,
  defaultJoinRole,
  defaultJoinPosition,
  className
}: ProjectMembersSectionProps) => {
  const [openInviteDialog, setOpenInviteDialog] = React.useState(false)
  const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const handleInvite = () => {
    if (onInviteClick) {
      onInviteClick()
      return
    }
    setOpenInviteDialog(true)
  }

  const handleRemoveConfirm = async () => {
    if (!memberToRemove || !onRemoveMember) return
    
    setIsRemoving(true)
    try {
      await onRemoveMember(memberToRemove.userId)
      setMemberToRemove(null)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <Card className={cn("bg-background shadow-none border-none", className)}>
        <CardHeader className="border-b mb-0 pb-4">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
              {title}
            </CardTitle>
            <Typography variant='extraSmallText' >
              {members.length} active users
            </Typography>
          </div>
          <CardAction>
            {action ?? (
              canManageMembers ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleInvite}
                  
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  <Typography variant="p" className="font-semibold">Invite Member</Typography>
                </Button>
              ) : null
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/40">
          {members.length > 0 ? (
            members.map((member) => (
              <div key={member.userId} className="p-4 px-6 hover:bg-muted/10 transition-colors group">
                <AvatarWithInfo
                  fullName={member.fullName}
                  imageUrl={member.imageUrl}
                  subtitle={member.position ? `${member.role} · ${member.position}` : member.role}
                  rightElement={
                    <div className="flex items-center gap-2">
                      <div className="w-24 flex justify-center">
                        {canManageMembers && onUpdateMember && currentUserId !== member.userId ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn(
                                  "h-7 w-20 relative flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                  member.role === ROLES.PIC 
                                    ? "bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-200" 
                                    : "bg-muted text-muted-foreground/70 hover:bg-muted-foreground/10"
                                )}
                              >
                                <span>{member.role === ROLES.PIC ? 'Owner' : member.role}</span>
                                <ChevronDown className="h-2.5 w-2.5 absolute right-2 opacity-40" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground/50 px-2 py-1.5">Change Role</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuRadioGroup 
                                value={member.role} 
                                onValueChange={(val) => onUpdateMember(member.userId, { role: val })}
                              >
                                {Object.values(ROLES).map((role) => (
                                  <DropdownMenuRadioItem key={role} value={role} className="text-xs font-semibold">
                                    {role === ROLES.PIC ? 'Owner' : role}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className={cn(
                            "w-20 inline-flex items-center justify-center py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            member.role === ROLES.PIC 
                              ? "bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-200" 
                              : "bg-muted text-muted-foreground/70"
                          )}>
                            {member.role === ROLES.PIC ? 'Owner' : member.role}
                          </span>
                        )}
                      </div>

                      <Separator orientation="vertical" className="h-4 mx-1 bg-border/60" />

                      <div className="w-24 flex justify-center">
                        {canManageMembers && onUpdateMember && currentUserId !== member.userId ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-20 relative flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/30 text-muted-foreground/60 hover:bg-muted-foreground/10 transition-all"
                              >
                                <span>{member.position || 'Member'}</span>
                                <ChevronDown className="h-2.5 w-2.5 absolute right-2 opacity-40" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground/50 px-2 py-1.5">Change Position</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuRadioGroup 
                                value={member.position || USER_POSITION.MEMBER} 
                                onValueChange={(val) => onUpdateMember(member.userId, { position: val })}
                              >
                                {Object.values(USER_POSITION).map((pos) => (
                                  <DropdownMenuRadioItem key={pos} value={pos} className="text-xs font-semibold">
                                    {pos}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="w-20 inline-flex items-center justify-center py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/30 text-muted-foreground/60">
                            {member.position || 'Member'}
                          </span>
                        )}
                      </div>
                      
                      <div className="w-10 flex justify-center">
                        {canManageMembers &&
                        onRemoveMember &&
                        managerId !== member.userId &&
                        currentUserId !== member.userId ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setMemberToRemove(member)}
                            className="h-9 w-9 p-0 rounded-lg border-border/60 bg-background hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="h-9 w-9" />
                        )}
                      </div>
                    </div>
                  }
                  className="gap-4"
                  textClassName="gap-1"
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Typography className="text-sm text-muted-foreground">
                No members found.
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title={`Remove ${memberToRemove?.fullName}?`}
        description="This member will lose access to this project."
        variant="destructive"
        confirmText="Remove Member"
        onConfirm={handleRemoveConfirm}
        isLoading={isRemoving}
      />

      <InviteMembersDialog
        open={openInviteDialog}
        onOpenChange={setOpenInviteDialog}
        onInvite={onInviteMembers}
        inviteLink={inviteLink}
        title={inviteDialogTitle}
        description={inviteDialogDescription}
        domainHint={inviteDomainHint}
        projectId={projectId}
        inviteMaxUses={inviteMaxUses}
        inviteUseCount={inviteUseCount}
        onUpdateMaxUses={onUpdateMaxUses}
        defaultJoinRole={defaultJoinRole}
        defaultJoinPosition={defaultJoinPosition}
      />
    </>
  )
}

