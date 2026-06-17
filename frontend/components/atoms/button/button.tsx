import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { button as buttonStyles } from "@/lib/styles"

const buttonVariants = cva(
  buttonStyles.base,
  {
    variants: {
      variant: {
        default: buttonStyles.variants.primary,
        outline: buttonStyles.variants.outline,
        secondary: buttonStyles.variants.secondary,
        ghost: buttonStyles.variants.ghost,
        destructive: buttonStyles.variants.danger,
        link: buttonStyles.variants.link,
        unstyled: buttonStyles.variants.unstyled,
        multiline: buttonStyles.variants.multiline,
      },
      size: {
        default: buttonStyles.sizes.md,
        xs: buttonStyles.sizes.xs,
        sm: buttonStyles.sizes.sm,
        lg: buttonStyles.sizes.lg,
        icon: buttonStyles.sizes.icon,
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-11",
        none: ""
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const resolvedSize = variant === "multiline" && size === "default" ? "none" : size

  return (
    <Comp
      suppressHydrationWarning
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size: resolvedSize, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
