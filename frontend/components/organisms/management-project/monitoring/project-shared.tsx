"use client"

import * as React from "react"
import { MoreHorizontal, ExternalLink, Trash2, Archive, ArchiveRestore } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { ProjectStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import {
  Button,
} from "@/components/atoms"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  ConfirmModal,
} from "@/components/molecules"

export interface ProjectRowProps {
  _id: Id<"projects">
  managerId?: Id<"users">
  name: string
  description?: string
  projectImage?: string
  status: ProjectStatus
  platform?: string
  members: { fullName: string; imageUrl?: string }[]
  progress: number
  dueDate?: string
  endDate?: number
  isArchived?: boolean
  totalTasks?: number
  completedTasks?: number
  createdAt: number
}

export const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  "In-Progress": {
    label: "In Track",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  "At Risk": {
    label: "At Risk",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  "Completed": {
    label: "Completed",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  "Planning": {
    label: "Planning",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  "Late": {
    label: "Late",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

export const progressColor = (progress: number, status: ProjectStatus) => {
  if (progress === 100 || status === "Completed") return "bg-green-500"
  if (status === "At Risk") return "bg-purple-500"
  if (status === "Late") return "bg-red-500"
  if (status === "In-Progress") return "bg-amber-500"
  if (status === "Planning") return "bg-slate-500"
  return "bg-blue-500"
}

import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { toast } from "sonner"

export interface ActionCellProps {
  project: ProjectRowProps
  onDelete?: (id: Id<"projects">) => Promise<void>
  onView?: (id: Id<"projects">) => void
  className?: string
}

export const ActionCell = ({ project, onDelete: onDeleteProp, onView: onViewProp, className }: ActionCellProps) => {
  const router = useRouter()
  const currentUser = useQuery(api.users.getCurrentUser)
  const remove = useMutation(api.project.remove)
  const update = useMutation(api.project.update)
  const canManageProject = !!currentUser && !!project.managerId && currentUser._id === project.managerId
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleView = React.useCallback(() => {
    if (onViewProp) return onViewProp(project._id)
    
    if (!project._id) {
      toast.error("Project ID is missing")
      return
    }
    router.push(`/project/${project._id}`)
  }, [project._id, router, onViewProp])

  const handleDelete = React.useCallback(async () => {
    if (!project._id) {
      toast.error("Project ID is missing")
      return
    }

    setIsProcessing(true)
    try {
      if (onDeleteProp) {
        await onDeleteProp(project._id)
      } else {
        await remove({ id: project._id })
      }
      toast.success("Project deleted successfully")
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project")
    } finally {
      setIsProcessing(false)
    }
  }, [project._id, remove, onDeleteProp])

  const handleArchiveToggle = React.useCallback(async () => {
    if (!project._id) return

    setIsProcessing(true)
    try {
      await update({
        id: project._id,
        isArchived: !project.isArchived
      })
      toast.success(project.isArchived ? "Project unarchived successfully" : "Project archived successfully")
      setIsArchiveModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project")
    } finally {
      setIsProcessing(false)
    }
  }, [project._id, project.isArchived, update])

  return (
    <div className={cn("flex justify-end pr-2", className)} onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="p-1 h-8 w-8 opacity-40 hover:opacity-100 transition-all hover:bg-muted rounded-full"
            variant="ghost"
            size="icon"
          >
            <MoreHorizontal className="w-4 h-4 text-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl shadow-xl border-border/40 bg-popover/95 backdrop-blur-md">
          <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
            Project Actions
          </div>
          <div className="space-y-0.5">
            <DropdownMenuItem onClick={handleView} className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer rounded-lg hover:bg-muted transition-colors">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>View Details</span>
            </DropdownMenuItem>
            
            {canManageProject && (
              <>
                <DropdownMenuItem 
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer rounded-lg hover:bg-muted transition-colors"
                >
                  {project.isArchived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                      <span>Unarchive Project</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 text-muted-foreground" />
                      <span>Archive Project</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 opacity-50" />
                
                <DropdownMenuItem 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {canManageProject && (
        <ConfirmModal 
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleDelete}
          isLoading={isProcessing}
          variant="destructive"
          title="Delete Project?"
          confirmText="Delete Project"
          description={`Are you sure you want to delete "${project.name}"? This action is permanent and will remove all associated data.`}
        />
      )}

      {canManageProject && (
        <ConfirmModal 
          open={isArchiveModalOpen}
          onOpenChange={setIsArchiveModalOpen}
          onConfirm={handleArchiveToggle}
          isLoading={isProcessing}
          variant={project.isArchived ? "default" : "warning"}
          title={project.isArchived ? "Unarchive Project?" : "Archive Project?"}
          confirmText={project.isArchived ? "Unarchive Now" : "Archive Now"}
          description={
            project.isArchived 
              ? `Are you sure you want to unarchive "${project.name}"? It will return to your active projects list.`
              : `Are you sure you want to archive "${project.name}"? It will be moved to the archived list and hidden from active views.`
          }
        />
      )}
    </div>
  )
}

