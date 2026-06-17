"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string") {
      if (args[0].includes("Encountered a script tag")) return;
      if (args[0].includes("`DialogContent` requires a `DialogTitle`")) return;
      if (args[0].includes("Missing `Description` or `aria-describedby`")) return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from "next-themes";
export type { ThemeProviderProps } from "next-themes";