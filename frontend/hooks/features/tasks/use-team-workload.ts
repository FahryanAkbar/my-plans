"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TASK_STATUS } from "@/lib";

export interface MemberWorkload {
  userId: string;
  fullName: string;
  imageUrl?: string;
  position: string;
  role: string;
  totalTasks: number;
  doneTasks: number;
  activeTasks: number;
  progress: number;
  status: "AVAILABLE" | "BUSY" | "OVERLOADED";
}

export const useTeamWorkload = (projectId: Id<"projects">) => {
  const members = useQuery(api.project.getProjectMembers, { projectId });
  const tasks = useQuery(api.task.getByProject, { projectId });

  const workloadData = useMemo(() => {
    if (!members || !tasks) return null;

    return members.map((member) => {
      const memberTasks = tasks.filter((t) => t.assigneeId === member.userId);
      const total = memberTasks.length;
      const done = memberTasks.filter((t) => t.status === TASK_STATUS.DONE).length;
      const active = total - done;
      
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      let status: MemberWorkload["status"] = "AVAILABLE";
      if (active > 8) status = "OVERLOADED";
      else if (active > 4) status = "BUSY";

      return {
        userId: member.userId,
        fullName: member.fullName,
        imageUrl: member.imageUrl,
        position: member.position,
        role: member.role,
        totalTasks: total,
        doneTasks: done,
        activeTasks: active,
        progress,
        status,
      };
    });
  }, [members, tasks]);

  return {
    data: workloadData as MemberWorkload[] | null,
    isLoading: members === undefined || tasks === undefined,
  };
};
