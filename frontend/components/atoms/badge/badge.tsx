import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { tokens } from "@/lib/styles/tokens"

const badgeVariants = cva(
  tokens.badge.base,
  {
    variants: {
      variant: {
        default: tokens.badge.primary,
        secondary: tokens.badge.purple,
        success: tokens.badge.success,
        warning: tokens.badge.warning,
        destructive: tokens.badge.danger,
        info: tokens.badge.info,
        outline: tokens.badge.outline,
        neutral: tokens.badge.neutral,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
