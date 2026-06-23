'use client'

import * as React from 'react'
import Link from 'next/link'
import { Edit2, Archive, RotateCcw, Trash2, LogOut } from 'lucide-react'

import { cn, ProjectStatus } from '@/lib'
import { 
  Typography,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@/components/atoms'
import { 
  ActionButtonGroup, 
  StatusWithLabel, 
  type ActionItem 
} from '@/components/organisms'

interface ProjectDetailHeaderProps {
  title: string
  icon?: string
  description?: string

  status?: ProjectStatus;
  breadcrumbs?: { label: string; href?: string }[];

  onEdit?: () => void
  onArchive?: () => void
  onRestore?: () => void
  onDelete?: () => void
  onLeave?: () => void

  className?: string
}

export const ProjectDetailHeader = ({
  title,
  icon,
  description,

  status,
  breadcrumbs = [],

  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onLeave,
  className
}: ProjectDetailHeaderProps) => {
  const actions: ActionItem[] = React.useMemo(() => {
    const list: ActionItem[] = []
    
    if (onEdit) {
      list.push({
        label: 'Edit',
        icon: Edit2,
        onClick: onEdit
      })
    }
    
    if (onArchive) {
      list.push({
        label: 'Archive',
        icon: Archive,
        onClick: onArchive
      })
    }
    
    if (onRestore) {
      list.push({
        label: 'Restore',
        icon: RotateCcw,
        onClick: onRestore
      })
    }
    
    if (onDelete) {
      list.push({
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        onClick: onDelete
      })
    }
    
    return list
  }, [onEdit, onArchive, onRestore, onDelete, onLeave])

  return (
    <div className={cn('flex flex-col gap-6 w-full', className)}>
      <div className="flex items-center justify-between gap-4">
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all">
      {/* Inline Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-muted/50 border border-border/40 text-3xl md:text-4xl flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <Typography variant="h2" className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </Typography>
                {status && (
                  <StatusWithLabel 
                    label="" 
                    status={status}
                    className="gap-0"
                    badgeClassName="h-6 px-3 text-[9px] font-bold uppercase tracking-wider rounded-full bg-muted border border-border/40 shadow-sm"
                  />
                )}
              </div>
              {description && (
                <Typography variant="p" className="text-muted-foreground text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
                  {description}
                </Typography>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {actions.length > 0 && (
            <ActionButtonGroup 
              actions={actions} 
              size="sm" 
              buttonClassName="rounded-full px-5 h-9 bg-muted/50 hover:bg-muted border-none shadow-none text-muted-foreground hover:text-foreground transition-all font-medium"
            />
          )}
        </div>
      </div>

        <div className="shrink-0 pt-1 flex items-center justify-end gap-3 ml-auto md:ml-0">
          {actions.length > 0 && (
            <ActionButtonGroup 
              actions={actions} 
              size="sm" 
              buttonClassName="rounded-3xl px-4 h-9 shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  )
}
