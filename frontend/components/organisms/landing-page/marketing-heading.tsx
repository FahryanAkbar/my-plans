'use client'

import Link from "next/link"

import { SignInButton } from "@clerk/nextjs"
import { useConvexAuth } from "convex/react"

import { Button, Loaders, Typography } from "@/components/atoms"
import { MarketingHeadingProps } from "@/types"
import { cn } from "@/lib"

export function MarketingHeading({
  title = (
    <>
      Your Projects, Tasks, & Plans. All in One Place. Welcome to{" "}
      <span className="underline">My Plans</span>
    </>
  ),
  description = (
    <>
      My Plans is a project management workspace designed to help you <br />
      organize tasks, track progress, and ship work faster.
    </>
  ),
  ctaLabel = "Enter App",
  ctaHref = "/monitoring",
  className,
}: MarketingHeadingProps) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  
  return (
      <div className={cn("max-w-3xl space-y-4", className)}>
        <Typography variant="h1">{title}</Typography>
        <Typography variant="h3">
          {description}
        </Typography>
      {isLoading && (
        <div
          className="flex items-center justify-center mt-4 text-gray-600 dark:text-gray-300">
            <Loaders size="sm" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button size="default" className="mt-4" variant="ghost">
          <Link href={ctaHref}>
            {ctaLabel}
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button size="default" className="mt-4" variant="ghost">
            {ctaLabel}
          </Button>
        </SignInButton>
      )}
    </div>
  )
}
