"use client"

import * as React from "react"
import { LayoutGrid, Plus } from "lucide-react"

import { Button, Typography } from "@/components/atoms"
import { AvatarGroup } from "@/components/organisms"
import { CreateProjectModal } from "../project/form"

import { Member } from "@/types"


export interface OverviewHeaderProps {
  title?: string
  description?: string
  members?: Member[]
  controls?: React.ReactNode
  icon?: React.ReactNode
}

export const OverviewHeader = ({
  title = "Project Overview",
  description = "Monitor your project performance and activities.",
  members,
  controls,
  icon,
}: OverviewHeaderProps) => {
  const [openCreateProject, setOpenCreateProject] = React.useState(false)

  return (
    <>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between w-full">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            {icon ?? <LayoutGrid className="h-4 w-4" />}
          </div>
          <div className="flex flex-col gap-1">
            <Typography variant="h3" className="leading-tight font-bold tracking-tight text-foreground">
              {title}
            </Typography>
            <Typography variant="p" className="text-sm text-muted-foreground/80 leading-snug">
              {description}
            </Typography>
          </div>
        </div>

        {(controls || (members && members.length > 0)) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0">
              {members && members.length > 0 && (
                <div className="flex items-center">
                  <AvatarGroup users={members} max={6} />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {controls && (
                <div className="w-full sm:w-70 shrink-0">
                  {controls}
                </div>
              )}

              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setOpenCreateProject(true)} 
                className="w-full sm:w-auto h-9 font-medium shadow-sm transition-all hover:shadow px-4 rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1.5 shrink-0" />
                Add project
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal
        open={openCreateProject}
        onOpenChange={() => setOpenCreateProject((prev) => !prev)}
      />
    </>
  )
}
