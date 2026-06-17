import * as React from 'react'

import { cn } from '@/lib'

export type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'absolute h-px w-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
          className,
        )}
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
        }}
        {...props}
      />
    )
  },
)

VisuallyHidden.displayName = 'VisuallyHidden'

export { VisuallyHidden }