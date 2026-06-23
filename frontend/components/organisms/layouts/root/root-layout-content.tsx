'use client'

import React, { ElementRef, useRef, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMediaQuery } from 'usehooks-ts'
import { useConvexAuth, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { useBreadcrumbs } from "@/hooks"
import { Header, Sidebar, MobileSidebar, SearchCommand, NotAuthenticate } from '@/components/organisms'
import { cn } from '@/lib/utils'

interface RootLayoutContentProps {
  children: React.ReactNode
}

export const RootLayoutContent = ({ children }: RootLayoutContentProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const breadcrumbs = useBreadcrumbs()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const create = useMutation(api.documents.create)

  const isLandingPage = pathname === "/"
  const isPublicPage = pathname?.startsWith("/preview") || pathname?.startsWith("/join") || isLandingPage

  const canShowSidebar = isAuthenticated && !isLoading && !isLandingPage
  const canShowHeader = !isLandingPage

  const isResizingRef = useRef(false)
  const sidebarRef = useRef<ElementRef<"aside">>(null)
  const contentRef = useRef<ElementRef<"div">>(null)

  const [isResetting, setIsResetting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(isMobile)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        collapse()
      } else {
        resetWidth()
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isMobile) {
      collapse()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile])

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault()
    event.stopPropagation()

    isResizingRef.current = true
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current || !canShowSidebar) return
    let newWidth = event.clientX

    if (newWidth < 120) {
      collapse()
      return
    }

    if (newWidth < 240) newWidth = 240
    if (newWidth > 480) newWidth = 480

    if (sidebarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`
    }
  }

  const handleMouseUp = () => {
    isResizingRef.current = false
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  const resetWidth = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(true)
      return
    }

    if (sidebarRef.current) {
      setIsCollapsed(false)
      setIsResetting(true)

      sidebarRef.current.style.width = isMobile ? "100%" : "240px"

      setTimeout(() => setIsResetting(false), 300)
    }
  }

  const collapse = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }

    if (sidebarRef.current) {
      setIsCollapsed(true)
      setIsResetting(true)

      sidebarRef.current.style.width = "0"

      setTimeout(() => setIsResetting(false), 300)
    }
  }

  const handleCreate = () => {
    const promise = create({ title: "Untitled" })
      .then((documentId) => router.push(`/documents/${documentId}`))

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note."
    })
  }

  return (
    <div className="flex h-full dark:bg-[#111111] bg-white overflow-hidden">
      {isAuthenticated && <SearchCommand />}

      {canShowSidebar && !isMobile && (
        <Sidebar
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          isResetting={isResetting}
          onCollapse={collapse}
          onResetWidth={resetWidth}
          sidebarRef={sidebarRef}
          onMouseDown={handleMouseDown}
          onCreate={handleCreate}
        />
      )}

      {canShowSidebar && isMobile && (
        <MobileSidebar
          open={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          onCreate={handleCreate}
        />
      )}

      <div
        ref={contentRef}
        className={cn(
          "flex-1 flex flex-col min-h-0 relative bg-background overflow-hidden",
          isResetting && "transition-all ease-in-out duration-300"
        )}
      >
        {canShowHeader && (
          <Header
            breadcrumbs={breadcrumbs}
            isCollapsed={isCollapsed}
            onOpen={resetWidth}
          />
        )}

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {!isLoading && !isAuthenticated && !isPublicPage ? (
            <NotAuthenticate />
          ) : (
            children
          )}
        </main>

      </div>
    </div>
  )
}
