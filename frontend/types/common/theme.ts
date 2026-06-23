export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

type Attribute = "class" | `data-${string}` | Array<"class" | `data-${string}`>

export type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
  systemTheme: ResolvedTheme
}

export type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: Attribute
  enableSystem?: boolean
  enableColorScheme?: boolean
  disableTransitionOnChange?: boolean
  value?: Partial<Record<Exclude<Theme, "system">, string>>
}