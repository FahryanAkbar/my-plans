/* eslint-disable react-hooks/purity */
"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TASK_STATUS } from "@/lib";
import { isBefore, startOfDay } from "date-fns";

export interface ProjectHealthData {
  strength: number;
  velocity: number;
  velocityTrend: number;
  statusDistribution: {
    done: number;
    inReview: number;
    inProgress: number;
    blocked: number;
    todo: number;
    overdue: number;
  };
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  blockedCount: number;
  doneCount: number;
  overdueCount: number;
  isLoading: boolean;
}

/**
 * 
 * 
 * 
 * 
 * 
 * @param projectId 
 * @returns {ProjectHealthData}
 */
export const useProjectHealth = (projectId: Id<"projects">): ProjectHealthData => {
  const tasks = useQuery(api.task.getByProject, { projectId });

  const analytics = useMemo(() => {
    const defaultState: ProjectHealthData = {
      strength: 0,
      velocity: 0,
      velocityTrend: 0,
      statusDistribution: { done: 0, inReview: 0, inProgress: 0, blocked: 0, todo: 0, overdue: 0 },
      totalTasks: 0,
      todoCount: 0,
      inProgressCount: 0,
      inReviewCount: 0,
      blockedCount: 0,
      doneCount: 0,
      overdueCount: 0,
      isLoading: tasks === undefined,
    };

    if (!tasks) return defaultState;

    const total = tasks.length;
    if (total === 0) return { ...defaultState, isLoading: false };

    const doneTasks = tasks.filter(t => t.status === TASK_STATUS.DONE);
    const inReviewTasks = tasks.filter(t => t.status === TASK_STATUS.IN_REVIEW);
    const inProgressTasks = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS);
    const blockedTasks = tasks.filter(t => t.status === TASK_STATUS.BLOCKED);
    const todoTasks = tasks.filter(t => t.status === TASK_STATUS.TODO);
    
    const today = startOfDay(new Date());
    const overdueTasks = tasks.filter(t => 
      t.status !== TASK_STATUS.DONE && 
      t.dueDate && 
      isBefore(new Date(t.dueDate), today)
    );

    const statusDistribution = {
      done: Math.round((doneTasks.length / total) * 100),
      inReview: Math.round((inReviewTasks.length / total) * 100),
      inProgress: Math.round((inProgressTasks.length / total) * 100),
      blocked: Math.round((blockedTasks.length / total) * 100),
      todo: Math.round((todoTasks.length / total) * 100),
      overdue: Math.round((overdueTasks.length / total) * 100),
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    
    const completedRecently = doneTasks.filter(t => t.completedAt && t.completedAt > sevenDaysAgo).length;
    const completedPreviously = doneTasks.filter(t => t.completedAt && t.completedAt <= sevenDaysAgo && t.completedAt > fourteenDaysAgo).length;

    const velocity = Math.min(Math.round((completedRecently / 5) * 100), 100);
    const velocityTrend = completedPreviously > 0 
      ? Math.round(((completedRecently - completedPreviously) / completedPreviously) * 100)
      : completedRecently > 0 ? 100 : 0;

    const progressWeight = (doneTasks.length / total) * 100;
    const overduePenalty = (overdueTasks.length / total) * 60; 
    const strength = Math.max(Math.round(progressWeight - overduePenalty), 0);

    return {
      strength,
      velocity,
      velocityTrend,
      statusDistribution,
      totalTasks: total,
      todoCount: todoTasks.length,
      inProgressCount: inProgressTasks.length,
      inReviewCount: inReviewTasks.length,
      blockedCount: blockedTasks.length,
      doneCount: doneTasks.length,
      overdueCount: overdueTasks.length,
      isLoading: false,
    };
  }, [tasks]);

  return analytics;
};
