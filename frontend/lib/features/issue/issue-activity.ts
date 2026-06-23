import { IssueActivity } from "@/types/features";
import { format, isToday, isYesterday, startOfDay } from "date-fns";

export interface GroupedActivity {
  id: string;
  user: IssueActivity["user"];
  issueId: string;
  issueTitle?: string;
  mainActivity: IssueActivity;
  subActivities: IssueActivity[];
  timestamp: number;
}

export interface DateGroupedActivity {
  dateLabel: string;
  groups: GroupedActivity[];
}

export const groupIssueActivities = (activities: IssueActivity[]): DateGroupedActivity[] => {
  if (!activities || activities.length === 0) return [];
  const sorted = [...activities].sort((a, b) => b.createdAt - a.createdAt);

  const dateGroupsMap = new Map<number, IssueActivity[]>();
  
  sorted.forEach(activity => {
    const day = startOfDay(new Date(activity.createdAt)).getTime();
    if (!dateGroupsMap.has(day)) {
      dateGroupsMap.set(day, []);
    }
    dateGroupsMap.get(day)?.push(activity);
  });

  const result: DateGroupedActivity[] = [];

  dateGroupsMap.forEach((dayActivities, day) => {
    let label = format(new Date(day), "d MMMM yyyy");
    if (isToday(new Date(day))) label = "Today";
    else if (isYesterday(new Date(day))) label = "Yesterday";

    const groups: GroupedActivity[] = [];
    
    dayActivities.forEach(activity => {
      const lastGroup = groups[groups.length - 1];
      const isSameActorAndIssue = 
        lastGroup && 
        lastGroup.user?.fullName === activity.user?.fullName && 
        lastGroup.issueId === activity.issueId.toString();

      if (isSameActorAndIssue) {
        lastGroup.subActivities.push(activity);
      } else {
        groups.push({
          id: activity._id,
          user: activity.user,
          issueId: activity.issueId.toString(),
          issueTitle: activity.issueTitle,
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
