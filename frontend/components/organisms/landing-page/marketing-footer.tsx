import Link from "next/link"

import { Button, Logo } from "@/components/atoms"
import { cn } from "@/lib"

import { type MarketingFooterProps, DEFAULT_LINKS } from "@/types"

export function MarketingFooter({
  className,
  logoHref = "/",
  links = DEFAULT_LINKS,
}: MarketingFooterProps) {
  return (
    <footer
      className={cn(
        "z-50 w-full bg-background px-4 py-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <Logo href={logoHref} />
      <div className="flex w-full flex-wrap items-center gap-2 text-muted-foreground sm:w-auto sm:ml-auto sm:justify-end">
        {links.map((item) => (
          <Button key={`${item.label}-${item.href}`} variant="ghost" size="sm" asChild>
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
    </footer>
  )
}
