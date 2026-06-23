import { tokens } from "./tokens"

/**
 * Surface Variants
 * Combinations of background, border, and shadows for structural elements
 */
export const surfaces = {
  // Main background surface
  main: `${tokens.surface.base} min-h-screen`,
  
  // Sidebar/Navigation surface
  sidebar: `${tokens.surface.sidebar} ${tokens.border.subtle} border-r`,
  
  // Card variants
  card: `${tokens.surface.card} ${tokens.border.base} ${tokens.radius.lg} ${tokens.shadow.sm} overflow-hidden`,
  cardSubtle: `${tokens.surface.subtle} ${tokens.border.subtle} ${tokens.radius.md}`,
  cardElevated: `${tokens.surface.card} ${tokens.border.base} ${tokens.radius.xl} ${tokens.shadow.md}`,
  
  // Section/Box wrappers
  section: `${tokens.surface.base} ${tokens.radius.xl} ${tokens.border.base} overflow-hidden`,
  
  // Popover/Dropdown surfaces
  overlay: `${tokens.surface.popover} ${tokens.border.strong} ${tokens.radius.md} ${tokens.shadow.lg}`,
  
  // Semantic containers
  danger: `${tokens.surface.danger} ${tokens.border.danger} ${tokens.radius.lg}`,
  warning: `${tokens.surface.warning} ${tokens.border.warning} ${tokens.radius.lg}`,
  success: `${tokens.surface.success} ${tokens.border.success} ${tokens.radius.lg}`,
  info: `${tokens.surface.info} ${tokens.border.info} ${tokens.radius.lg}`,
} as const

/**
 * Interactive Variants
 * Combinations of hover, active, and focus states for clickable elements
 */
export const interactive = {
  // Ghost item (sidebar menu, list item)
  ghost: `${tokens.state.hover} ${tokens.state.active} ${tokens.radius.md} ${tokens.transition.fast}`,
  
  // Subtle action item
  subtle: `${tokens.surface.subtle} ${tokens.state.hover} ${tokens.state.active} ${tokens.radius.md} ${tokens.transition.normal}`,
  
  // Primary action item
  primary: `bg-primary text-primary-foreground hover:bg-primary/90 ${tokens.state.active} ${tokens.radius.md} ${tokens.shadow.sm}`,
  
  // Danger action item
  danger: `bg-destructive text-destructive-foreground hover:bg-destructive/90 ${tokens.state.active} ${tokens.radius.md}`,
  
  // Focus ring helper
  focus: tokens.state.focus,
} as const

/**
 * Typography Combinations
 */
export const typography = {
  h1: `${tokens.fontSize["2xl"]} ${tokens.color.primary}`,
  h2: `${tokens.fontSize.xl} ${tokens.color.primary}`,
  h3: `${tokens.fontSize.lg} ${tokens.fontWeight.semibold}`,
  
  body: `${tokens.fontSize.base} ${tokens.color.muted}`,
  bodySubtle: `${tokens.fontSize.sm} ${tokens.color.subtle}`,
  
  label: `${tokens.fontSize.xs} ${tokens.fontWeight.medium} uppercase tracking-wider ${tokens.color.subtle}`,
  
  // Semantic typography
  error: `${tokens.fontSize.sm} ${tokens.color.error}`,
  success: `${tokens.fontSize.sm} ${tokens.color.success}`,
  warning: `${tokens.fontSize.sm} ${tokens.color.warning}`,
} as const

/**
 * Layout/Spacing Helpers
 */
export const layouts = {
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  gridStandard: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${tokens.spacing.gap}`,
  
  stack: `flex flex-col ${tokens.spacing.gap}`,
  pageContainer: `${tokens.spacing.md} max-w-7xl mx-auto`,
} as const

/**
 * Status Banner Variants (Combining surface, border, and typography)
 */
export const status = {
  error: `${surfaces.danger} p-4 flex gap-3 ${typography.error}`,
  warning: `${surfaces.warning} p-4 flex gap-3 ${typography.warning}`,
  success: `${surfaces.success} p-4 flex gap-3 ${typography.success}`,
  info: `${surfaces.info} p-4 flex gap-3 ${tokens.color.info}`,
} as const

/**
 * Common Design Patterns
 * Use these to shorten long utility strings for recurring UI elements
 */
export const patterns = {
  // Typography
  textTinyCaps: "text-[10px] font-black uppercase tracking-tight",
  textLabel: "text-[11px] font-bold tracking-tight text-muted-foreground/60",
  textTimestamp: "text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter tabular-nums",
  textMeta: "text-[10px] font-medium text-muted-foreground/60 tracking-tight",
  
  // Containers & Layouts
  badgeBase: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full",
  boxSubtle: "flex items-center gap-1.5 px-2 py-1 rounded-xl border border-border/40 bg-muted/30",
  avatarSubtle: "border border-border/50 shrink-0 shadow-sm",
  emptyBox: "text-center py-12 bg-muted/5 rounded-2xl border border-dashed border-border/50",
  replyContainer: "ml-10 space-y-4 border-l-2 border-border/30 pl-6 relative",
  formContainer: "relative rounded-2xl border border-border/50 bg-muted/20 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300",
  
  // Reaction Patterns
  reactionPill: "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all active:scale-90",
  reactionActive: "bg-primary/10 border-primary/30 text-primary shadow-sm",
  reactionInactive: "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-border/50",
  
  // Action Buttons (Micro)
  actionButtonGhost: "h-7 px-2 text-[10px] font-bold rounded-lg transition-all hover:bg-primary/5 text-muted-foreground hover:text-primary",
  actionButtonIcon: `${tokens.size.actionSm} flex items-center justify-center rounded-lg transition-all text-muted-foreground hover:text-primary hover:bg-primary/5`,
  actionButtonDestructive: `${tokens.size.actionSm} flex items-center justify-center rounded-lg transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10`,
  
  // Timeline Patterns
  timelineLine: "absolute inset-0 ml-5 -translate-x-px h-full w-0.5 bg-linear-to-b from-border/60 via-border/30 to-transparent",
  timelineDot: "absolute h-1.5 w-1.5 rounded-full bg-border/60",
  timelineIcon: "absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full border border-border/60 bg-background shadow-sm ring-4 ring-background group-hover:border-primary/40 group-hover:shadow-md group-hover:scale-110 transition-all duration-300 z-10",
  
  // Empty States & Placeholders
  emptyState: "group relative flex flex-col items-center justify-center w-full py-10 border border-dashed border-border/40 rounded-[2rem] hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-500 cursor-pointer overflow-hidden",
  iconBoxLarge: "relative z-10 h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500",
  
  // Micro Patterns
  statusDot: "w-2 h-2 rounded-full",
  
  // Helpers
  strikeThrough: "line-through opacity-40",
} as const