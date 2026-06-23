import { format, isToday, isYesterday } from "date-fns";

export const groupActivitiesByDate = <T extends { createdAt: number }>(activities: T[]) => {
  return activities.reduce((groups: Record<string, T[]>, activity) => {
    let dateLabel = format(activity.createdAt, "MMMM d, yyyy");
    
    if (isToday(activity.createdAt)) dateLabel = "Today";
    else if (isYesterday(activity.createdAt)) dateLabel = "Yesterday";
    
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(activity);
    
    return groups;
  }, {});
};
