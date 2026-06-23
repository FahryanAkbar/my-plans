'use client'

import * as React from 'react'

import { cn } from '@/lib'
import { Button, DialogFooter } from '@/components/atoms'

export interface InviteDialogFooterProps {
  onCancel: () => void
  onSubmit: () => void
  cancelLabel?: string
  submitLabel?: string
  submittingLabel?: string
  isSubmitting?: boolean
  disabled?: boolean
  className?: string
  submitClassName?: string
}

export const InviteDialogFooter = ({
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Invite your team',
  submittingLabel = 'Inviting...',
  isSubmitting = false,
  disabled = false,
  className,
  submitClassName,
}: InviteDialogFooterProps) => {
  const isDisabled = disabled || isSubmitting

  return (
    <DialogFooter className={cn('px-6 md:px-8 py-6 flex items-center justify-end gap-3 border-t bg-muted/5', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isDisabled}
        className="h-10"
      >
        {cancelLabel}
      </Button>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className={cn("h-10 px-6", submitClassName)}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </DialogFooter>
  )
}
