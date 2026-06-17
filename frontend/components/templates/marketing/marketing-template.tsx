import type { ReactNode } from "react"

import {
  MarketingFooter,
  MarketingHeading,
  MarketingHeroes,
  MarketingNavbar,
} from "@/components/organisms"
import { cn } from "@/lib"

type MarketingTemplateProps = {
  children?: ReactNode
  className?: string
  contentClassName?: string
  showNavbar?: boolean
  showFooter?: boolean
  showModeToggle?: boolean
}

export function MarketingTemplate({
  children,
  className,
  contentClassName,
  showNavbar = true,
  showFooter = true,
  showModeToggle = true,
}: MarketingTemplateProps) {
  const content = children ?? (
    <>
      <MarketingHeading />
      <MarketingHeroes />
    </>
  )

  return (
    <div className={cn("min-h-full flex-1 flex flex-col bg-background", className)}>
      {showNavbar && <MarketingNavbar showModeToggle={showModeToggle} />}
      <main
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-y-8 px-6 pb-10 text-center md:justify-start",
          showNavbar && "pt-40",
          contentClassName
        )}
      >
        {content}
      </main>
      {showFooter && <MarketingFooter />}
    </div>
  )
}
