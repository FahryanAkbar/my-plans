"use client";

import { useMemo } from "react";
import { TaskCardProps } from "@/components/organisms";
import { TASK_STATUS, TaskStatus } from "@/lib/constants/task";
import { Id } from "@/convex/_generated/dataModel";
import { useProjectPermission } from "@/hooks/features/project/use-project-permission";
import { PERMISSIONS } from "@/lib";

export const useTaskList = (projectId: Id<"projects">, tasks: TaskCardProps[]) => {
  const { can } = useProjectPermission(projectId);
  const canCreate = can(PERMISSIONS.TASK_CREATE);

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, TaskCardProps[]> = {
      [TASK_STATUS.TODO]: [],
      [TASK_STATUS.IN_PROGRESS]: [],
      [TASK_STATUS.IN_REVIEW]: [],
      [TASK_STATUS.BLOCKED]: [],
      [TASK_STATUS.DONE]: [],
    };

    tasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });

    return groups;
  }, [tasks]);

  return {
    groupedTasks,
    canCreate,
    can
  };
};
