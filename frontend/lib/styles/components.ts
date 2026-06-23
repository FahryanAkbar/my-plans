import { tokens } from "./tokens"
import { surfaces, interactive, typography, layouts } from "./variants"

/**
 * Button Component Styles
 */
export const button = {
  base: `inline-flex items-center justify-center gap-2 ${tokens.radius.lg} ${tokens.fontWeight.medium} ${tokens.transition.fast} ${tokens.state.hover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none`,
  sizes: {
    xs: "h-7 px-2.5 text-[11px]",
    sm: "h-8 px-3.5 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  },
  variants: {
    primary:
      "bg-btn-primary-bg text-btn-primary-text shadow-sm hover:bg-btn-primary-hover active:bg-btn-primary-active focus-visible:ring-btn-primary-ring",
    secondary:
      "bg-btn-secondary-bg text-btn-secondary-text border border-btn-secondary-border hover:bg-btn-secondary-hover-bg active:bg-btn-secondary-active-bg focus-visible:ring-btn-secondary-border",
    outline:
      "border border-btn-outline-border bg-btn-outline-bg text-btn-outline-text hover:bg-btn-outline-hover-bg hover:text-btn-outline-hover-text focus-visible:ring-btn-outline-border",
    ghost:
      "bg-btn-ghost-bg text-btn-ghost-text hover:bg-btn-ghost-hover-bg hover:text-btn-ghost-hover-text active:bg-btn-ghost-active-bg focus-visible:ring-btn-primary-ring",
    danger:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive",
    link: "bg-btn-link-bg text-btn-link-text underline-offset-4 hover:underline hover:text-btn-link-hover-text active:text-btn-link-active-text focus-visible:ring-btn-primary-ring p-0 h-auto",
    unstyled: "p-0 h-auto w-auto bg-transparent border-none shadow-none hover:scale-100 active:scale-100 rounded-none ring-0 focus-visible:ring-0 ring-offset-0",
    multiline: "inline-flex items-start justify-between text-left whitespace-normal h-auto py-2.5 px-5 text-sm",
  }
} as const




/**
 * Input, Form & Selection Styles
 */
export const form = {
  label: `${tokens.fontSize.xs} ${tokens.fontWeight.medium} text-muted-foreground mb-1.5`,
  input: `flex w-full ${tokens.radius.md} border ${tokens.border.base} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground ${tokens.state.focus} disabled:cursor-not-allowed disabled:opacity-50`,
  checkbox: `h-4 w-4 shrink-0 ${tokens.radius.sm} border ${tokens.border.base} ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground`,
  switch: {
    root: `peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center ${tokens.radius.full} border-2 border-transparent ${tokens.transition.normal} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted`,
    thumb: `pointer-events-none block h-4 w-4 ${tokens.radius.full} bg-background shadow-lg ring-0 ${tokens.transition.normal} data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0`,
  },
  error: `text-destructive ${tokens.fontSize.xs} mt-1`,
} as const

/**
 * Navigation & Feedback Styles
 */
export const navigation = {
  sidebarItem: `flex items-center gap-3 px-3 py-2 ${tokens.radius.md} ${tokens.fontSize.sm} text-sidebar-foreground`,
  sidebarItemActive: `bg-accent text-sidebar-foreground font-medium`,
  navbar: `h-14 ${layouts.flexBetween} px-4 border-b ${tokens.surface.glass}`,
  breadcrumb: {
    list: `flex flex-wrap items-center gap-1.5 break-words ${tokens.fontSize.sm} text-muted-foreground`,
    link: `hover:text-foreground ${tokens.transition.fast}`,
    separator: "opacity-50",
  }
} as const

/**
 * Feedback & Loading Styles
 */
export const feedback = {
  loader: "animate-spin text-muted-foreground",
  skeleton: `animate-pulse bg-muted ${tokens.radius.md}`,
  progress: {
    root: `relative h-2 w-full overflow-hidden ${tokens.radius.full} bg-muted`,
    indicator: `h-full w-full flex-1 bg-primary ${tokens.transition.slow}`,
  }
} as const

/**
 * Data Display Styles
 */
export const dataDisplay = {
  avatar: {
    root: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
    image: "aspect-square h-full w-full",
    fallback: `flex h-full w-full items-center justify-center rounded-full bg-muted ${tokens.fontSize.xs}`,
  },
  badge: {
    base: tokens.badge.base,
    status: {
      todo: tokens.badge.neutral,
      inProgress: tokens.badge.info,
      done: tokens.badge.success,
      blocked: tokens.badge.danger,
      review: tokens.badge.purple,
    },
    priority: {
      low: tokens.badge.neutral,
      medium: tokens.badge.info,
      high: tokens.badge.orange,
      urgent: tokens.badge.danger,
    }
  },
  tooltip: `z-50 overflow-hidden ${tokens.radius.md} bg-primary px-3 py-1.5 ${tokens.fontSize.xs} text-primary-foreground animate-in fade-in-0 zoom-in-95 shadow-md`,
} as const

/**
 * Overlay & Modal Styles
 */
export const overlay = {
  dialog: {
    content: `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 ${tokens.surface.card} p-6 ${tokens.shadow.xl} duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg`,
    overlay: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    header: "flex flex-col space-y-1.5 text-center sm:text-left",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
  },
  popover: `z-50 w-72 rounded-md border ${tokens.surface.popover} p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95`,
  command: {
    root: `flex h-full w-full flex-col overflow-hidden ${tokens.radius.md} bg-popover text-popover-foreground`,
    item: `relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50`,
  }
} as const

/**
 * Card & Container Styles
 */
export const container = {
  section: `space-y-6 ${tokens.spacing.section}`,
  box: surfaces.section,
  boxHeader: `px-6 py-4 border-b ${tokens.border.subtle} ${layouts.flexBetween}`,
  boxContent: "p-6",
  boxFooter: `px-6 py-4 border-t ${tokens.border.subtle} bg-muted/30`,
} as const

/**
 * Table Styles (Notion-like)
 */
export const table = {
  wrapper: `w-full border ${tokens.border.base} ${tokens.radius.lg} overflow-hidden`,
  header: `bg-muted/50 border-b ${tokens.border.subtle} text-left ${tokens.fontSize.xs} uppercase tracking-wider text-muted-foreground`,
  cell: `px-4 py-3 ${tokens.fontSize.sm} border-b ${tokens.border.subtle} last:border-0`,
  row: `${tokens.state.hover} transition-colors`,
} as const

/**
 * specialized Component Sections
 */
export const advancedSection = {
  card: surfaces.danger,
  container: "p-6 space-y-4",
  title: `${typography.h3} ${tokens.color.error}`,
  description: typography.bodySubtle,
} as const

/**
 * Card Component Styles
 */
export const card = {
  base: `${surfaces.card} flex flex-col`,
  header: "flex flex-row items-center justify-between p-6",
  title: typography.h3,
  description: typography.bodySubtle,
  content: "p-6 pt-0",
  footer: `flex items-center p-6 pt-0 mt-6 border-t ${tokens.border.subtle} bg-muted/20`,
} as const
