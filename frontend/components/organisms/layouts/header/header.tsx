'use client'

import { Menu } from 'lucide-react'
import { 
  HeaderBreadcrumbs, 
  BreadcrumbItemType 
} from './header-breadcrumbs'
import { HeaderAction } from './header-action'
import { cn } from '@/lib'

interface HeaderProps {
  breadcrumbs: BreadcrumbItemType[]
  projectName?: string
  className?: string
  isCollapsed?: boolean
  onOpen?: () => void
}

export const Header = ({
  breadcrumbs,
  projectName,
  className,
  isCollapsed,
  onOpen
}: HeaderProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur-sm transition-all',
        className
      )}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {isCollapsed && onOpen && (
          <Menu 
            role="button"
            onClick={onOpen}
            className="h-5 w-5 text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
          />
        )}
        <HeaderBreadcrumbs 
          breadcrumbs={breadcrumbs} 
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <HeaderAction 
          projectIdentity={projectName ? {name: projectName}: undefined}
        />
      </div>
    </header>
  )
}