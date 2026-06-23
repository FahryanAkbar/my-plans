'use client'

import React from "react"
import Link from "next/link"
import { Logo, Typography } from "@/components/atoms"
import { cn } from "@/lib/utils"

interface FooterProps {
  className?: string
  showCopyright?: boolean
  showLogo?: boolean
}

export const Footer = ({ 
  className,
  showCopyright = true,
  showLogo = true
}: FooterProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      "w-full border-t bg-background/50 backdrop-blur-sm py-6 md:py-8 transition-all",
      className
    )}>
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row px-6 mx-auto">
        
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-3">
          {showLogo && (
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
          )}
          
          {showCopyright && (
            <Typography className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {currentYear} <span className="font-medium text-foreground">My Plan</span>. 
              Built with Convex & Next.js.
            </Typography>
          )}
        </div>
        
        <nav className="flex items-center gap-6" aria-label="Footer Navigation">
          <Link 
            href="/privacy" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
          <Link 
            href="/terms" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          <Link 
            href="https://github.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
          >
            Github
          </Link>
        </nav>
      </div>
    </footer>
  )
}