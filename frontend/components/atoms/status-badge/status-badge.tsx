"use client"

import { Badge } from "@/components/atoms/badge"
import { cn } from "@/lib/utils"

export type StatusType =
  | "Completed"
  | "In-Progress"
  | "At Risk"
  | "Planning"
  | "Late"
  | "custom"

type StatusConfig = {
  label: string
  variant: "success" | "warning" | "secondary" | "neutral" | "destructive"
}

const STATUS_MAP: Record<Exclude<StatusType, "custom">, StatusConfig> = {
  Completed: {
    label: "Completed",
    variant: "success",
  },
  "In-Progress": {
    label: "In Progress",
    variant: "warning",
  },
  "At Risk": {
    label: "At Risk",
    variant: "secondary",
  },
  Planning: {
    label: "Planning",
    variant: "neutral",
  },
  Late: {
    label: "Late",
    variant: "destructive",
  }
}

export type StatusBadgeProps = {
  status?: StatusType
  label?: string
  className?: string
  showDot?: boolean
}

export const StatusBadge = ({
  status = "Planning",
  label,
  className,
  showDot = false,
}: StatusBadgeProps) => {
  const config =
    status !== "custom" ? STATUS_MAP[status] : undefined

  const finalLabel = label ?? config?.label ?? "Unknown"

  return (
    <Badge
      variant={config?.variant ?? "neutral"}
      className={cn(
        "flex items-center justify-center gap-1.5 px-2.5 shadow-none",
        className
      )}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {finalLabel}
    </Badge>
  )
}