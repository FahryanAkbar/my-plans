'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardAction, 
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/atoms'
import { ProjectField } from '@/components/organisms'

interface ProjectProfileSectionProps {
  title: string
  imageUrl?: string
  fallback: string
  action?: React.ReactNode
  fields: {
    label: string
    value: React.ReactNode
    icon?: React.ElementType
  }[]
  className?: string
}

export const ProjectProfileSection = ({
  title,
  imageUrl,
  fallback,
  action,
  fields,
  className
}: ProjectProfileSectionProps) => {
  return (
    <Card className={cn("bg-background shadow-none border-none", className)}>
      <CardHeader className="border-b mb-4 pb-3">
        <CardTitle className="text-lg md:text-xl font-bold uppercase tracking-wide">
          {title}
        </CardTitle>
        {action && (
          <CardAction>
            {action}
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-5 items-start">
        <div className="shrink-0">
          <Avatar className="size-20 rounded-xl ring-2 ring-muted/40 shadow-sm">
            <AvatarImage src={imageUrl} alt={title} className="object-cover" />
            <AvatarFallback className="text-xl font-bold bg-muted/30">
              {fallback}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1 w-full">
          {fields.map((field, index) => (
            <ProjectField
              key={`${field.label}-${index}`}
              label={field.label}
              value={field.value}
              icon={field.icon}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
