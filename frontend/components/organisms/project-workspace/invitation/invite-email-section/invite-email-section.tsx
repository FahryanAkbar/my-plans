'use client'

import * as React from 'react'
import { 
  ChevronDown, 
  Plus, 
  Trash2,
  ShieldCheck,
  User,
  Eye,
  Star,
  Code2,
  Database,
  Palette,
  Bug,
  BarChart,
  LucideIcon
} from 'lucide-react'

import { cn } from '@/lib'
import { ROLES, type Role, INVITATION_DEFAULT_POSITION, type InvitationPosition } from '@/lib/constants'
import { Button, Input, Typography } from '@/components/atoms'
import { isValidEmail } from '@/hooks/features/invitation/use-invite-members'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/molecules'
import { EmailStatusMessage, type EmailExistenceInfo } from '../email-status-message'

export type InviteEmailRow = {
  id: string
  email: string
  position: InvitationPosition
  role: Role
}

export interface InviteEmailSectionProps {
  title?: string
  rows: InviteEmailRow[]
  onEmailChange: (id: string, email: string) => void
  onRoleChange: (id: string, role: Role) => void
  onPositionChange: (id: string, position: InvitationPosition) => void
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  addLabel?: string
  emailPlaceholder?: string
  maxRows?: number
  disabled?: boolean
  roleOptions?: Role[]
  positionOptions?: InvitationPosition[]
  existenceData?: EmailExistenceInfo[]
  className?: string
}

export const InviteEmailSection = ({
  title = 'Invite with email',
  rows,
  onEmailChange,
  onRoleChange,
  onPositionChange,
  onAddRow,
  onRemoveRow,
  addLabel = 'Add another',
  emailPlaceholder = 'Add email here',
  maxRows = 8,
  disabled = false,
  roleOptions = Object.values(ROLES),
  positionOptions = Object.values(INVITATION_DEFAULT_POSITION),
  existenceData,
  className,
}: InviteEmailSectionProps) => {
  const canAdd = !disabled && rows.length < maxRows

  return (
    <section className={cn('space-y-3', className)}>
      <Typography className="text-sm font-semibold">{title}</Typography>

      <div className="space-y-3">
        {rows.map((row) => {
          const isInvalid = row.email.length > 0 && !isValidEmail(row.email)
          const statusInfo = existenceData?.find((d) => d.email === row.email.trim())

          return (
            <div 
              key={row.id} 
              className="p-4 rounded-xl border border-border/50 bg-background/40 backdrop-blur-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm"
            >
              {/* EMAIL ROW */}
              <div className="flex items-start gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Input
                    type="email"
                    value={row.email}
                    onChange={(e) => onEmailChange(row.id, e.target.value)}
                    placeholder={emailPlaceholder}
                    className={cn(
                      'h-10 w-full transition-all duration-200 bg-background/50 border-border/40',
                      isInvalid
                        ? 'border-destructive focus-visible:ring-destructive/20'
                        : statusInfo?.isMember 
                          ? 'border-amber-500/40 focus-visible:ring-amber-500/20'
                          : statusInfo?.isRegistered
                            ? 'border-blue-500/40 focus-visible:ring-blue-500/20'
                            : 'focus-visible:ring-primary/20'
                    )}
                    disabled={disabled}
                  />
                  {isInvalid && (
                    <Typography className="text-[10px] text-destructive font-medium ml-1 animate-in fade-in slide-in-from-top-1">
                      Please enter a valid email address
                    </Typography>
                  )}
                  <EmailStatusMessage info={statusInfo} />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => onRemoveRow(row.id)}
                  disabled={disabled || (rows.length <= 1 && row.email === '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* SELECTION ROW */}
              <div className="grid grid-cols-2 gap-3">
                {/* ROLE SELECTION */}
                <div className="space-y-1.5">
                  <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">Role</Typography>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-full justify-between border-border/40 bg-background/40 hover:bg-background transition-all"
                        disabled={disabled}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {(() => {
                            const roleIcons: Record<string, LucideIcon> = {
                              [ROLES.PIC]: Star,
                              [ROLES.FE]: Code2,
                              [ROLES.BE]: Database,
                              [ROLES.UIUX]: Palette,
                              [ROLES.QA]: Bug,
                              [ROLES.BA]: BarChart,
                            }
                            const Icon = roleIcons[row.role] || User
                            return <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                          })()}
                          <span className="text-xs truncate font-medium">{row.role}</span>
                        </div>
                        <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40 p-1">
                      {Object.values(ROLES).map((role) => {
                        const roleIcons: Record<string, LucideIcon> = {
                          [ROLES.PIC]: Star,
                          [ROLES.FE]: Code2,
                          [ROLES.BE]: Database,
                          [ROLES.UIUX]: Palette,
                          [ROLES.QA]: Bug,
                          [ROLES.BA]: BarChart,
                        }
                        const Icon = roleIcons[role] || User
                        return (
                          <DropdownMenuItem 
                            key={role} 
                            onClick={() => onRoleChange(row.id, role)}
                            className={cn(
                              "gap-2.5 px-3 py-2 rounded-lg cursor-pointer",
                              row.role === role && "bg-primary/5 text-primary font-semibold"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-xs">{role}</span>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* POSITION SELECTION */}
                <div className="space-y-1.5">
                  <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">Access</Typography>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-full justify-between border-border/40 bg-background/40 hover:bg-background transition-all"
                        disabled={disabled}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {(() => {
                            const posIcons: Record<string, LucideIcon> = {
                              [INVITATION_DEFAULT_POSITION.ADMIN]: ShieldCheck,
                              [INVITATION_DEFAULT_POSITION.MEMBER]: User,
                              [INVITATION_DEFAULT_POSITION.VIEWER]: Eye,
                            }
                            const Icon = posIcons[row.position] || User
                            return <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                          })()}
                          <span className="text-xs truncate font-medium">{row.position}</span>
                        </div>
                        <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 p-1">
                      {Object.values(INVITATION_DEFAULT_POSITION).map((pos) => {
                        const posIcons: Record<string, LucideIcon> = {
                          [INVITATION_DEFAULT_POSITION.ADMIN]: ShieldCheck,
                          [INVITATION_DEFAULT_POSITION.MEMBER]: User,
                          [INVITATION_DEFAULT_POSITION.VIEWER]: Eye,
                        }
                        const Icon = posIcons[pos] || User
                        return (
                          <DropdownMenuItem 
                            key={pos} 
                            onClick={() => onPositionChange(row.id, pos)}
                            className={cn(
                              "gap-2.5 px-3 py-2 rounded-lg cursor-pointer",
                              row.position === pos && "bg-primary/5 text-primary font-semibold"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-xs">{pos}</span>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={onAddRow}
        disabled={!canAdd}
        className="h-9 px-2 text-primary hover:text-primary"
      >
        <Plus className="h-4 w-4 mr-1" />
        {addLabel}
      </Button>
    </section>
  )
}
