"use client"

import Link from "next/link"
import { useConvexAuth } from "convex/react"
import { SignInButton } from "@clerk/nextjs"

import { Logo, Button, Loaders } from "@/components/atoms"
import { ModeToggle } from "@/components/molecules"

import { type MarketingNavbarProps } from "@/types"
import { useScrollTop } from "@/hooks"
import { cn } from "@/lib"

export function MarketingNavbar({
  className,
  logoHref = "/",
  showModeToggle = true,
  sticky = true,
}: MarketingNavbarProps) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const scrolled = useScrollTop()

  return (
    <header
      className={cn(
        "z-50 flex w-full items-center justify-between bg-background px-4 py-3 md:p-6",
        sticky && "fixed top-0",
        scrolled && "border-b border-border shadow-sm",
        className
      )}
    >
      <Logo href={logoHref} />
      <div className="flex items-center gap-x-2">
        {isLoading && (
          <Loaders size="sm" />
        )}
        {!isAuthenticated && !isLoading && (
          <>
            <SignInButton mode="modal">
              <Button size="sm">
                Log In
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button size="sm">
                Get Started
              </Button>
            </SignInButton>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant='ghost' size="sm">
              <Link 
                href="/monitoring"
              >
                Dashboard
              </Link>
            </Button>
          </>
        )}
        {showModeToggle && <ModeToggle />}
      </div>
    </header>
  )
}
