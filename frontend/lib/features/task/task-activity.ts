import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { ActivityFeeds } from "@/components/organisms";

export interface GroupedTaskActivity {
  id: string;
  userName: string;
  userImage?: string;
  taskId?: string;
  taskTitle: string;
  mainActivity: ActivityFeeds;
  subActivities: ActivityFeeds[];
  timestamp: number;
}

export interface DateGroupedTaskActivity {
  dateLabel: string;
  groups: GroupedTaskActivity[];
}

export const groupTaskActivities = (activities: ActivityFeeds[]): DateGroupedTaskActivity[] => {
  if (!activities || activities.length === 0) return [];
  const sorted = [...activities].sort((a, b) => b.createdAt - a.createdAt);

  const dateGroupsMap = new Map<number, ActivityFeeds[]>();
  
  sorted.forEach(activity => {
    const day = startOfDay(new Date(activity.createdAt)).getTime();
    if (!dateGroupsMap.has(day)) {
      dateGroupsMap.set(day, []);
    }
    dateGroupsMap.get(day)?.push(activity);
  });

  const result: DateGroupedTaskActivity[] = [];

  dateGroupsMap.forEach((dayActivities, day) => {
    let label = format(new Date(day), "d MMMM yyyy");
    if (isToday(new Date(day))) label = "Today";
    else if (isYesterday(new Date(day))) label = "Yesterday";

    const groups: GroupedTaskActivity[] = [];
    
    dayActivities.forEach(activity => {
      const lastGroup = groups[groups.length - 1];
      const isSameActorAndTask = 
        lastGroup && 
        lastGroup.userName === activity.userName && 
        lastGroup.taskId === activity.taskId?.toString();

      if (isSameActorAndTask) {
        lastGroup.subActivities.push(activity);
      } else {
        groups.push({
          id: activity.id,
          userName: activity.userName,
          userImage: activity.userImage,
          taskId: activity.taskId?.toString(),
          taskTitle: activity.taskTitle,
          mainActivity: activity,
          subActivities: [],
          timestamp: activity.createdAt
        });
      }
    });

    result.push({
      dateLabel: label,
      groups
    });
  });

  return result;
};
