import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay 
} from "date-fns";

export const generateCalendarDays = (currentDate: Date): Date[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
};

export const filterDataByDay = <T extends { date: number }>(logs: T[] | undefined, day: Date): T[] => {
  if (!logs) return [];
  return logs.filter(item => isSameDay(new Date(item.date), day));
};
