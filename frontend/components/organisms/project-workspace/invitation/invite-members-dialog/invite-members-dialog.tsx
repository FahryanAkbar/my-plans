'use client'

import { 
  cn,
  ROLES, 
  INVITATION_DEFAULT_POSITION, 
} from '@/lib'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/atoms'

import {
  type InviteMemberPayload,
  type InviteMembersResult,
} from '@/types/features'
import { useInviteMembers } from '@/hooks'

import { InviteDialogFooter } from '../invite-dialog-footer'
import { InviteEmailSection } from '../invite-email-section'
import { InviteLinkSection } from '../invite-link-section'
import { InviteTeamPreview } from '../invite-team-preview'

export interface InviteMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite?: (members: InviteMemberPayload[]) => Promise<InviteMembersResult> | void
  inviteLink?: string
  projectName?: string
  sendEmail?: boolean
  sendEmailEndpoint?: string
  emailSubject?: string
  emailBrandName?: string
  title?: string
  description?: string
  domainHint?: string
  maxRows?: number
  projectId?: string
  inviteMaxUses?: number | null
  inviteUseCount?: number
  onUpdateMaxUses?: (maxUses: number | null | undefined, silent?: boolean) => Promise<void> | void
  defaultJoinRole?: string
  defaultJoinPosition?: string
  className?: string
}

export const InviteMembersDialog = ({
  open,
  onOpenChange,
  onInvite,
  inviteLink = '',
  projectName = 'Project',
  sendEmail = true,
  sendEmailEndpoint = '/api/send',
  emailSubject,
  emailBrandName = 'Notion Clone Trial',
  title = 'Invite your teammates',
  description = 'Collaborate with your team to get the most out of your project.',
  maxRows = 3,
  projectId,
  inviteMaxUses,
  inviteUseCount = 0,
  onUpdateMaxUses,
  defaultJoinRole,
  defaultJoinPosition,
  className,
}: InviteMembersDialogProps) => {
  const {
    rows,
    isSubmitting,
    existenceData,
    addRow,
    removeRow,
    updateRow,
    handleInvite,
    handleUpdateMaxUses,
    handleUpdateDefaultJoinRole,
    handleUpdateDefaultJoinPosition,
    handleRegenerateInviteLink,
  } = useInviteMembers({
    open,
    projectId,
    onOpenChange,
    onInvite,
    inviteLink,
    projectName,
    sendEmail,
    sendEmailEndpoint,
    emailSubject,
    emailBrandName,
  })

  const ROLE_OPTIONS = Object.values(ROLES)
  const POSITION_OPTIONS = Object.values(INVITATION_DEFAULT_POSITION)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn('max-w-5xl p-0 overflow-hidden', className)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-border/40">
          <div className="p-6 md:p-8 space-y-8 flex flex-col">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="text-3xl font-extrabold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground/80 leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1">
              <InviteLinkSection 
                link={inviteLink} 
                inviteMaxUses={inviteMaxUses}
                inviteUseCount={inviteUseCount}
                onUpdateMaxUses={onUpdateMaxUses || handleUpdateMaxUses}
                onRegenerate={handleRegenerateInviteLink}
                defaultJoinRole={defaultJoinRole}
                defaultJoinPosition={defaultJoinPosition}
                onUpdateDefaultJoinRole={handleUpdateDefaultJoinRole}
                onUpdateDefaultJoinPosition={handleUpdateDefaultJoinPosition}
              />
            </div>
          </div>

          <div className="p-6 md:p-8 bg-muted/10 flex flex-col min-h-0 overflow-hidden border-t lg:border-t-0">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/60 hover:scrollbar-thumb-border space-y-6">
              <InviteEmailSection
                rows={rows}
                roleOptions={ROLE_OPTIONS}
                positionOptions={POSITION_OPTIONS}
                maxRows={maxRows}
                disabled={isSubmitting}
                onEmailChange={(id, email) => updateRow(id, { email })}
                onRoleChange={(id, role) => updateRow(id, { role })}
                onPositionChange={(id, position) => updateRow(id, { position })}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                existenceData={existenceData}
              />

              {rows.length <= 1 && (
                <div className="mt-auto pt-4 animate-in fade-in zoom-in-95 duration-700">
                  <InviteTeamPreview 
                    className="border-none bg-transparent" 
                    containerClassName="p-0"
                    
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <InviteDialogFooter
          onCancel={() => onOpenChange(false)}
          onSubmit={handleInvite}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
