'use client'
 
import * as React from 'react'
import { Copy, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
 
import { cn } from '@/lib'
import { 
  Input, 
  Button, 
  Typography,
  Switch,
} from '@/components/atoms'
import { 
  ConfirmModal
} from '@/components/molecules'
import { 
  ShieldCheck, 
  User, 
  Eye, 
  Star, 
  Code2, 
  Database, 
  Palette, 
  Bug, 
  BarChart 
} from 'lucide-react'
import { ROLES, INVITATION_DEFAULT_POSITION } from '@/lib/constants'
 
export interface InviteLinkSectionProps {
  title?: string
  link?: string
  emptyText?: string
  copyLabel?: string
  copiedMessage?: string
  disabled?: boolean
  onCopy?: (link: string) => Promise<void> | void
  onRegenerate?: () => Promise<void> | void
  inviteMaxUses?: number | null
  inviteUseCount?: number
  onUpdateMaxUses?: (maxUses: number | null | undefined, silent?: boolean) => Promise<void> | void
  regenerateTitle?: string
  regenerateDescription?: string
  defaultJoinRole?: string
  defaultJoinPosition?: string
  onUpdateDefaultJoinRole?: (role: string) => Promise<void> | void
  onUpdateDefaultJoinPosition?: (position: string) => Promise<void> | void
  className?: string
}
 
export const InviteLinkSection = ({
  title = 'Invite with link',
  link = '',
  emptyText = 'No invite link generated yet',
  copyLabel = 'Copy',
  copiedMessage = 'Invite link copied',
  disabled = false,
  onCopy,
  onRegenerate,
  inviteMaxUses,
  inviteUseCount = 0,
  onUpdateMaxUses,
  regenerateTitle = 'Regenerate invite link?',
  regenerateDescription = 'The previous invite link may no longer be used.',
  defaultJoinRole = ROLES.FE,
  defaultJoinPosition = INVITATION_DEFAULT_POSITION.MEMBER,
  onUpdateDefaultJoinRole,
  onUpdateDefaultJoinPosition,
  className,
}: InviteLinkSectionProps) => {
  const [inputValue, setInputValue] = React.useState<string>(
    inviteMaxUses?.toString() || '10'
  )
  const [isRegenerateOpen, setIsRegenerateOpen] = React.useState(false)

  React.useEffect(() => {
    if (inviteMaxUses !== undefined && inviteMaxUses !== null) {
      setInputValue(inviteMaxUses.toString())
    }
  }, [inviteMaxUses])

  const handleCopy = async () => {
    if (!link || disabled) return

    try {
      if (onCopy) {
        await onCopy(link)
      } else {
        await navigator.clipboard.writeText(link)
      }
      toast.success(copiedMessage)
    } catch {
      toast.error('Failed to copy invite link')
    }
  }

  const handleCommitUpdate = () => {
    if (!onUpdateMaxUses) return
    const numericValue = parseInt(inputValue, 10)

    if (isNaN(numericValue) || numericValue < 1) {
      setInputValue(inviteMaxUses?.toString() || '1')
      onUpdateMaxUses(inviteMaxUses || 1, true)
      return
    }

    if (numericValue < inviteUseCount) {
      toast.error(
        `Max usage cannot be less than current usage (${inviteUseCount} already used)`,
        { duration: 3000 }
      )
      setInputValue(inviteMaxUses?.toString() || inviteUseCount.toString())
      return
    }

    const limitedValue = Math.min(10, numericValue)
    setInputValue(limitedValue.toString())
    if (limitedValue !== inviteMaxUses) {
      onUpdateMaxUses(limitedValue, true)
    }
  }

  const isLimited = inviteMaxUses !== undefined && inviteMaxUses !== null
  const isFull = isLimited && inviteUseCount >= (inviteMaxUses || 0)

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Typography className="text-sm font-semibold">{title}</Typography>
          {isLimited && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-medium border shadow-sm transition-all duration-300",
              isFull 
                ? "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20" 
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20"
            )}>
              {inviteUseCount} / {inviteMaxUses} used
            </span>
          )}
        </div>
        
        {onRegenerate && (
          <ConfirmModal
            title={regenerateTitle}
            description={regenerateDescription}
            open={isRegenerateOpen}
            onOpenChange={setIsRegenerateOpen}
            onConfirm={async () => {
              if (onRegenerate) {
                await onRegenerate()
              }
              setIsRegenerateOpen(false)
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={disabled}
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
              Regenerate
            </Button>
          </ConfirmModal>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative group">
          <Input
            disabled
            value={link || emptyText}
            className="h-11 pr-24 bg-muted/20 border-border/60 text-muted-foreground cursor-not-allowed"
            aria-label="Invite link"
          />
          <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
             <Button
                type="button"
                variant="ghost"
                size="sm"
                
                onClick={handleCopy}
                disabled={!link || disabled}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                {copyLabel}
              </Button>
          </div>
        </div>

        {onUpdateMaxUses && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col gap-0.5">
              <Typography className="text-xs font-medium">
                Limit usage
              </Typography>
              <Typography className="text-[10px] text-muted-foreground">
                Restrict how many people can join via this link
              </Typography>
            </div>
            
            <div className="flex items-center gap-3">
              {isLimited && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-300">
                  <Input 
                    type="number"
                    min={inviteUseCount > 0 ? inviteUseCount : 1}
                    max={10}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleCommitUpdate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommitUpdate()
                        e.currentTarget.blur()
                      }
                    }}
                    className="h-8 w-14 text-center text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Typography className="text-[10px] text-muted-foreground">
                    {inviteUseCount > 0 ? `Min ${inviteUseCount}, Max 10` : 'Max 10'}
                  </Typography>
                </div>
              )}
              <Switch 
                checked={isLimited}
                onCheckedChange={(checked) => {
                  onUpdateMaxUses(checked ? 10 : undefined)
                }}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {(onUpdateDefaultJoinRole || onUpdateDefaultJoinPosition) && (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col gap-0.5">
              <Typography className="text-xs font-semibold">Link Configuration</Typography>
              <Typography className="text-[10px] text-muted-foreground">
                Define the default entry point for users joining via this link
              </Typography>
            </div>
            
            <div className="space-y-4">
              {onUpdateDefaultJoinRole && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Default Role</Typography>
                    <Typography className="text-[10px] text-muted-foreground italic">Scroll to see more</Typography>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mask-fade-right">
                    {[
                      { id: ROLES.PIC, label: 'PIC', icon: Star },
                      { id: ROLES.FE, label: 'FE', icon: Code2 },
                      { id: ROLES.BE, label: 'BE', icon: Database },
                      { id: ROLES.UIUX, label: 'UI/UX', icon: Palette },
                      { id: ROLES.QA, label: 'QA', icon: Bug },
                      { id: ROLES.BA, label: 'BA', icon: BarChart },
                    ].map((role) => (
                      <Button
                        key={role.id}
                        type="button"
                        variant={defaultJoinRole === role.id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 px-3 shrink-0 flex items-center gap-2 transition-all duration-200 border-border/40",
                          defaultJoinRole === role.id 
                            ? "ring-1 ring-primary ring-offset-1 ring-offset-background font-bold shadow-sm" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        onClick={() => onUpdateDefaultJoinRole(role.id)}
                        disabled={disabled}
                      >
                        <role.icon className={cn("h-3.5 w-3.5", defaultJoinRole === role.id ? "text-primary-foreground" : "text-muted-foreground")} />
                        <span className="text-[10px] font-semibold">{role.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {onUpdateDefaultJoinPosition && (
                <div className="space-y-2">
                  <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Default Position</Typography>
                  <div className="flex p-1 gap-1 bg-muted/20 rounded-lg border border-border/40 max-w-xs">
                    {[
                      { id: INVITATION_DEFAULT_POSITION.ADMIN, label: 'Admin', icon: ShieldCheck },
                      { id: INVITATION_DEFAULT_POSITION.MEMBER, label: 'Member', icon: User },
                      { id: INVITATION_DEFAULT_POSITION.VIEWER, label: 'Viewer', icon: Eye },
                    ].map((pos) => (
                      <Button
                        key={pos.id}
                        type="button"
                        variant={defaultJoinPosition === pos.id ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "flex-1 h-7 px-0 gap-1.5 transition-all duration-200",
                          defaultJoinPosition === pos.id 
                            ? "bg-background shadow-sm text-foreground font-semibold" 
                            : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                        )}
                        onClick={() => onUpdateDefaultJoinPosition(pos.id)}
                        disabled={disabled}
                      >
                        <pos.icon className="h-3 w-3" />
                        <span className="text-[10px]">{pos.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
