'use client'

import * as React from 'react'
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/atoms"
import { cn } from "@/lib/utils"

export type ProjectTab = 
  | 'overview'
  | 'members'
  | 'monitoring'
  | 'settings'
  | 'topology'
  | 'digital-twin'
  | 'batch'

interface TabConfig {
  value: ProjectTab
  label: string
}

export interface ProjectDetailTabsProps {
  activeTab: ProjectTab
  onTabChange: (tab: ProjectTab) => void
  className?: string
  canManageMembers?: boolean
}

const PROJECT_TABS: TabConfig[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'members', label: 'Members' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'topology', label: 'Topology' },
  { value: 'digital-twin', label: 'Digital Twin' },
  { value: 'batch', label: 'Batch Processing' },
  { value: 'settings', label: 'Settings' },
]

export const ProjectDetailTabs = ({
  activeTab,
  onTabChange,
  className,
  canManageMembers = true
}: ProjectDetailTabsProps) => {
  const tabs = React.useMemo(() => {
    return canManageMembers ? PROJECT_TABS : PROJECT_TABS.filter(t => t.value !== 'settings')
  }, [canManageMembers])

  return (
    <div className={cn("w-full border-b border-border/40", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange(value as ProjectTab)} 
        className="px-0"
      >
        <TabsList 
          variant="line" 
          className="h-10 bg-transparent gap-6"
        >
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className={cn(
                "h-full px-2 border-0 bg-transparent",
                "text-sm font-semibold text-muted-foreground/60 transition-colors",
                "hover:text-foreground/80",
                "data-active:text-foreground data-active:after:opacity-100"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
