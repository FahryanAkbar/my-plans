"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Loaders, 
  Badge, 
  Progress, 
  Typography 
} from "@/components/atoms"
import { EmptyItem } from "@/components/molecules"
import { AvatarGroup } from "@/components/organisms"
import { cn } from "@/lib/utils"
import { 
  Calendar,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

export type TaskData = {
  id: string
  title: string
  progress: number
  status: string
  priority?: string
  projectName?: string
  projectId?: string
  isOverdue?: boolean
  comments?: number
  attachments?: number
  dueDate?: string
  users?: { fullName: string; imageUrl?: string }[]
}

export type OverviewTasksProps = {
  tasks?: TaskData[]
  className?: string
  projectId?: string
}

const PRIORITY_COLORS = {
  high: { border: "border-l-red-500", progress: "bg-red-500", badge: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  medium: { border: "border-l-orange-500", progress: "bg-orange-500", badge: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
  low: { border: "border-l-green-500", progress: "bg-green-500", badge: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
  default: { border: "border-l-blue-500", progress: "bg-blue-500", badge: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" }
}

const CustomTaskRow = ({ task }: { task: TaskData }) => {
  const priorityKey = task.priority?.toLowerCase() as keyof typeof PRIORITY_COLORS
  const colors = PRIORITY_COLORS[priorityKey] || PRIORITY_COLORS.default

  const priorityLabel = task.priority?.toLowerCase() === "medium" 
    ? "Med" 
    : task.priority 
      ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() 
      : ""

  return (
    <div className={cn(
      "group flex items-center py-2.5 px-3 hover:bg-muted/30 transition-colors border-l-2 rounded-r-sm",
      task.isOverdue ? "border-l-red-500/80" : "border-l-transparent"
    )}>

      <div className="flex-1 min-w-0 pr-4">
        {task.projectId ? (
          <Link href={`project/${task.projectId}/tasks`} className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors hover:underline block">
            {task.title}
          </Link>
        ) : (
          <Typography variant="span" className="text-sm font-semibold text-foreground truncate block">{task.title}</Typography>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">

        <div className="flex items-center gap-1.5 w-14">
          <Progress value={task.progress} className="w-7 h-1.5 bg-muted" indicatorClassName={colors.progress} />
          <Typography variant="caption" className="font-medium tabular-nums">{task.progress}%</Typography>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 w-20">
          <Calendar className={cn("w-3.5 h-3.5 shrink-0", task.isOverdue ? "text-red-500" : "text-muted-foreground")} />
          <Typography 
            variant="caption" 
            className={cn("font-medium whitespace-nowrap", task.isOverdue ? "text-red-500" : "")}
          >
            {task.dueDate || "No date"}
          </Typography>
        </div>

        <div className="hidden sm:flex w-7 items-center justify-center">
          {task.users && task.users.length > 0 && (
            <AvatarGroup users={task.users} max={1} className="scale-[0.80]" />
          )}
        </div>

        <div className="w-10 flex justify-center">
          {task.priority && (
            <Badge className={cn("px-2 py-0.5 text-[10px] font-semibold border-none shadow-none rounded-md whitespace-nowrap", colors.badge)}>
              {priorityLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export const OverviewTasks = ({ tasks: tasksProp, className }: OverviewTasksProps) => {
  const realTasks = useQuery(api.task.getUserInProgress)
  
  const tasks = tasksProp ?? (realTasks as TaskData[] | undefined)
  const isLoading = tasks === undefined

  const allTasks = tasks || []
  const displayTasks = allTasks.slice(0, 5)

  const overdueTasks = displayTasks.filter((t) => t.isOverdue)
  const onTrackTasks = displayTasks.filter((t) => !t.isOverdue)

  return (
    <Card className={cn("rounded-2xl shadow-sm flex flex-col h-full bg-card overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <CardTitle className="text-base font-semibold">In Progress Tasks</CardTitle>
          {!isLoading && tasks && (
            <Badge className="bg-muted/80 text-foreground hover:bg-muted rounded-full px-2 py-0.5 text-xs font-semibold shadow-none border-none">
              {tasks.length} tasks
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-5 pb-5 pt-0 flex flex-col gap-5 min-h-75">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loaders size="md" />
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyItem 
              title="No tasks in progress" 
              description="You don't have any active tasks at the moment."
              className="border-none shadow-none bg-transparent"
            />
          </div>
        ) : (
          <>
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 pl-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                  <Typography variant="caption" className="font-bold uppercase tracking-widest">OVERDUE</Typography>
                </div>
                {overdueTasks.map(task => <CustomTaskRow key={task.id} task={task} />)}
              </div>
            )}

            {onTrackTasks.length > 0 && (
              <div className="space-y-2">
                <Typography variant="caption" className="font-bold uppercase tracking-widest pl-1">ON TRACK</Typography>
                {onTrackTasks.map(task => <CustomTaskRow key={task.id} task={task} />)}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}