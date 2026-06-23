'use client'

import Link from "next/link"
import React from "react"
import { useMediaQuery } from "usehooks-ts"

import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbEllipsis,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Typography,
} from "@/components/atoms"

export interface BreadcrumbItemType {
  label: string
  href: string
}

interface HeaderBreadcrumbsProps {
  breadcrumbs: BreadcrumbItemType[]
  maxItems?: number
}

export const HeaderBreadcrumbs = ({
  breadcrumbs,
  maxItems: propMaxItems = 3
}: HeaderBreadcrumbsProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const effectiveMaxItems = isMobile ? 2 : Math.max(2, propMaxItems)

  if (!breadcrumbs || breadcrumbs.length === 0) return null
  const shouldTruncate = breadcrumbs.length > effectiveMaxItems
  
  const displayedItems = shouldTruncate 
    ? [breadcrumbs[0], ...breadcrumbs.slice(-effectiveMaxItems + 1)]
    : breadcrumbs

  const truncatedItems = shouldTruncate 
    ? breadcrumbs.slice(1, -effectiveMaxItems + 1)
    : []

  if (isMobile) {
    const currentPage = breadcrumbs[breadcrumbs.length - 1]
    return (
      <Breadcrumb className="flex items-center min-w-0">
        <BreadcrumbList className="flex-nowrap whitespace-nowrap min-w-0">
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage>
              <Typography variant="span" className="max-w-40 truncate block font-medium text-sm">
                {currentPage.label}
              </Typography>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb className="flex items-center">
      <BreadcrumbList className="flex-nowrap whitespace-nowrap">
        {displayedItems.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === displayedItems.length - 1
          
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-50 truncate font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={item.href} 
                      className="max-w-37.5 truncate hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
              {shouldTruncate && isFirst && (
                <>
                  <BreadcrumbItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          suppressHydrationWarning
                          className="flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground p-1 transition-colors outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <BreadcrumbEllipsis className="h-4 w-4" />
                          <Typography variant="span" className="sr-only">Toggle truncated breadcrumbs</Typography>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        side="bottom"
                        sideOffset={2}
                        className="z-120 w-48 p-1"
                      >
                        <div className="flex flex-col gap-0.5">
                          {truncatedItems.map((truncatedItem) => (
                            <Link
                              key={truncatedItem.href}
                              href={truncatedItem.href}
                              className="rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {truncatedItem.label}
                            </Link>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
