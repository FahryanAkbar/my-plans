"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ActivityAction, ActivityFeeds } from "@/components/organisms/overview-task/recent-activity-feed";

/**
 * useRecentActivity Hook
 * 
 * Fetches and formats recent task activities for a specific project with pagination.
 * 
 * @param projectId
 * @returns { activities: ActivityFeeds[], isLoading: boolean, status: string, loadMore: function }
 */
export const useRecentActivity = (projectId: Id<"projects">) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.projectActivity.getByProject,
    { projectId },
    { initialNumItems: 10 }
  );

  const formattedActivities: ActivityFeeds[] = results.map((activity) => ({
    id: activity._id,
    userName: activity.userName,
    userImage: activity.userImage,
    action: activity.action as ActivityAction,
    taskTitle: activity.taskTitle,
    oldValue: activity.oldValue,
    newValue: activity.newValue,
    taskId: activity.taskId,
    createdAt: activity.createdAt,
  }));

  return {
    activities: formattedActivities,
    isLoading: status === "LoadingFirstPage",
    status,
    loadMore: () => loadMore(10),
  };
};
