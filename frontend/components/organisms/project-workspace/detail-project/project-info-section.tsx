'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardAction
} from '@/components/atoms'
import { ProjectField } from '@/components/organisms'

interface ProjectInfoSectionProps {
  title: string
  description?: string
  action?: React.ReactNode
  columns?: 2 | 3 | 4
  fields: {
    label: string
    value: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
  }[]
  className?: string
}

export const ProjectInfoSection = ({
  title,
  description,
  action,
  columns = 3,
  fields,
  className
}: ProjectInfoSectionProps) => {
  return (
    <Card className={cn("bg-background shadow-none border-none", className)}>
      <CardHeader className="border-b mb-4 pb-3">
        <CardTitle className="text-lg md:text-xl font-bold">
          {title}
        </CardTitle>
        {description && (
          <CardDescription>
            {description}
          </CardDescription>
        )}
        {action && (
          <CardAction>
            {action}
          </CardAction>
        )}
      </CardHeader>

      <CardContent className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4"
      )}>
        {fields.map((field, index) => (
          <ProjectField
            key={`${field.label}-${index}`}
            label={field.label}
            value={field.value}
            icon={field.icon}
          />
        ))}
      </CardContent>
    </Card>
  )
}
