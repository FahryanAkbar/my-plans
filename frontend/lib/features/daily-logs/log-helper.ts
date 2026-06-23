import { format, isToday, isYesterday, subDays, startOfDay, formatDistanceToNow } from "date-fns";

export interface LogHistoryItem {
  date: Date;
  label: string;
  subLabel: string;
  dateKey: string;
}

export const getQuickHistoryItems = (count: number = 3): LogHistoryItem[] => {
  return Array.from({ length: count }).map((_, i) => {
    const date = subDays(startOfDay(new Date()), i);
    
    let label = format(date, "EEEE");
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";

    return {
      date,
      label,
      subLabel: format(date, "dd MMM yyyy"),
      dateKey: format(date, "yyyy-MM-dd")
    };
  });
};

export const isSameLogDate = (dateA: Date, dateB: Date): boolean => {
  return format(dateA, "yyyy-MM-dd") === format(dateB, "yyyy-MM-dd");
};

export const getSyncStatusMessage = (lastSynced?: number, isLoading?: boolean): string => {
  if (isLoading && !lastSynced) return "Syncing...";
  if (!lastSynced) return "Not synced";
  return `Synced ${formatDistanceToNow(lastSynced)} ago`;
};