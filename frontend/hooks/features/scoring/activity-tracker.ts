'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Activity, ActivityType } from '@/types/features'

export const useActivityTracker = (projectId: Id<"projects">) => {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const projectActivities = useQuery(api.projectActivity.getByProject, { 
    projectId, 
    paginationOpts: { numItems: 50, cursor: null } 
  });

  const activityStats = useQuery(api.projectActivity.getActivityCountsByDate, { projectId });

  const isLoading = projectActivities === undefined || activityStats === undefined;

  const activities: Activity[] = React.useMemo(() => {
    if (!projectActivities) return [];

    let filtered = projectActivities.page.map((act) => ({
      id: act._id,
      userName: act.userName,
      userImage: act.userImage,
      action: act.action,
      targetName: act.taskTitle,
      timestamp: act.createdAt,
      type: (act.action === 'created' ? 'create' : 
             act.action === 'status_changed' ? 'status' : 'update') as ActivityType
    }));

    if (selectedDate) {
      filtered = filtered.filter(act => 
        format(act.timestamp, 'yyyy-MM-dd') === selectedDate
      );
    }

    return filtered;
  }, [projectActivities, selectedDate]);

  return {
    activities,
    activityStats,
    isLoading,
    selectedDate,
    setSelectedDate
  };
};
