import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/lib'

export type TypographyVariant = 
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'blockquote'
  | 'table'
  | 'list'
  | 'inlineCode'
  | 'lead'
  | 'largeText'
  | 'smallText'
  | 'extraSmallText'
  | 'muted'
  | 'span'
  | 'label'
  | 'caption'

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant
  asChild?: boolean
}

export const variantClasses: Record<TypographyVariant, string> = {
  h1: 'scroll-m-20 text-center text-5xl font-extrabold tracking-tight lg:text-6xl',
  h2: 'scroll-m-20 text-left text-4xl font-extrabold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  h6: 'scroll-m-20 text-base font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-0',
  blockquote: 'mt-6 border-l-2 pl-6 italic [&:not(:first-child)]:mt-10',
  table: 'my-6 w-full border-collapse text-center',
  list: 'my-6 ml-6 list-disc [&>li]:mt-2',
  inlineCode: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
  lead: 'text-xl text-muted-foreground',
  largeText: 'text-lg font-semibold tracking-tight',
  smallText: 'text-sm font-semibold tracking-tight text-muted-foreground',
  extraSmallText: 'text-xs font-semibold tracking-tight text-muted-foreground',
  muted: 'text-muted-foreground',
  span: 'inline',
  label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  caption: 'text-xs text-muted-foreground',
}

const defaultElement: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  blockquote: 'blockquote',
  table: 'table',
  list: 'ul',
  inlineCode: 'code',
  lead: 'p',
  largeText: 'p',
  smallText: 'small',
  extraSmallText: 'small',
  muted: 'p',
  span: 'span',
  label: 'label',
  caption: 'span',
}

export function Typography({
  variant = 'p',
  className,
  children,
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp = asChild ? Slot.Root : defaultElement[variant]

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(variantClasses[variant], className)}
      {...props}
    >{children}</Comp>
  )
}

export default Typography