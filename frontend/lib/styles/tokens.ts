export const tokens = {
  /**
   * Semantic Color Tokens
   * Use for text, icons, or decorative elements
   */
  color: {
    primary: "text-primary",
    success: "text-success",
    error: "text-danger",
    warning: "text-warning",
    info: "text-info",
    purple: "text-secondary",
    orange: "text-warning",
    neutral: "text-muted-foreground",
    muted: "text-muted-foreground",
    subtle: "text-muted-foreground/60",
    inverse: "text-background dark:text-foreground",
  },

  /**
   * Surface & Background Tokens
   * Defines the layering and depth of the UI
   */
  surface: {
    base: "bg-background",
    subtle: "bg-muted/40 dark:bg-white/5",
    accent: "bg-accent",
    popover: "bg-popover/95 backdrop-blur-sm",
    card: "bg-card",
    sidebar: "bg-sidebar",
    
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    purple: "bg-secondary/10 text-secondary-foreground",
    orange: "bg-warning/10 text-warning",
    neutral: "bg-muted text-muted-foreground",
    
    glass: "bg-background/80 backdrop-blur-md border border-white/20 dark:border-white/10",
  },

  /**
   * Badge & Tag Styles
   * Predefined styles for status, priority, and category labels
   */
  badge: {
    base: "px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 w-fit border",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    purple: "bg-secondary/10 text-secondary-foreground border-secondary/20",
    orange: "bg-warning/10 text-warning border-warning/20",
    neutral: "bg-muted text-muted-foreground border-border",
    outline: "bg-transparent border border-border text-muted-foreground",
  },



  /**
   * Border & Divider Tokens
   */
  border: {
    base: "border border-border/60 dark:border-border/40",
    subtle: "border border-border/30 dark:border-border/20",
    strong: "border border-border dark:border-border/60",
    
    danger: "border border-danger/30",
    success: "border border-success/30",
    warning: "border border-warning/30",
    info: "border border-info/30",
  },

  /**
   * Border Radius Tokens
   */
  radius: {
    none: "rounded-none",
    xs: "rounded-sm",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  },

  /**
   * Typography: Size & Weight
   */
  fontSize: {
    xs: "text-[11px] leading-tight",
    sm: "text-xs leading-normal",
    base: "text-sm leading-relaxed",
    lg: "text-base leading-relaxed font-medium",
    xl: "text-lg leading-snug font-semibold",
    "2xl": "text-xl leading-snug font-bold tracking-tight",
  },

  fontWeight: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  },

  /**
   * Spacing Tokens (Based on 4px scale)
   */
  spacing: {
    xs: "p-1",      // 4px
    sm: "p-2",      // 8px
    md: "p-4",      // 16px
    lg: "p-6",      // 24px
    xl: "p-8",      // 32px
    gap: "gap-4",
    section: "py-12",
  },

  /**
   * Elevation & Shadows
   */
  shadow: {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl dark:shadow-black/60",
    soft: "shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
    inner: "shadow-inner",
  },

  /**
   * Z-Index Layering
   */
  zIndex: {
    hide: "-z-10",
    base: "z-0",
    dropdown: "z-50",
    sticky: "z-[100]",
    modal: "z-[200]",
    popover: "z-[300]",
    tooltip: "z-[400]",
  },

  /**
   * Animation & Transitions
   */
  transition: {
    fast: "transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
  },

  /**
   * Sizing Tokens
   * Common fixed sizes for icons, avatars, and interactive targets
   */
  size: {
    // Icon sizes
    iconXs: "h-3 w-3",
    iconSm: "h-3.5 w-3.5",
    iconMd: "h-4 w-4",
    iconLg: "h-5 w-5",
    iconXl: "h-6 w-6",
    icon2xl: "h-7 w-7",
    icon3xl: "h-8 w-8",
    icon4xl: "h-10 w-10",
    icon5xl: "h-12 w-12",
    
    // Avatar sizes
    avatarXs: "h-6 w-6",
    avatarSm: "h-8 w-8",
    avatarMd: "h-10 w-10",
    avatarLg: "h-12 w-12",
    avatarXl: "h-16 w-16",
    avatar2xl: "h-20 w-20",
    avatar3xl: "h-24 w-24",
    avatar4xl: "h-32 w-32",
    avatar5xl: "h-40 w-40",
    
    // Interactive target sizes (buttons, etc)
    actionXs: "h-6 w-6",
    actionSm: "h-7 w-7",
    actionMd: "h-8 w-8",
    actionLg: "h-10 w-10",
    actionXl: "h-12 w-12",
    action2xl: "h-14 w-14",
    action3xl: "h-16 w-16",
    action4xl: "h-20 w-20",
    action5xl: "h-24 w-24",
  },

  /**
   * Interactive States
   */
  state: {
    hover: "cursor-pointer transition-colors",
    active: "transition-colors brightness-90",
    focus: "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 outline-none",
    disabled: "opacity-50 pointer-events-none grayscale cursor-not-allowed",
  }
} as const


