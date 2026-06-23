
export const formatDate = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatFlag = (value?: boolean) => (value ? "Yes" : "No");

export const formatStatus = (value?: string) => {
  if (!value) return "-";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getCurrentPeriod = () => {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  const day = now.getDate();
  const week = Math.ceil(day / 7);
  return `${month} ${year} · Week ${week}`;
};

export const getRecentPeriods = () => {
  const periods = [];
  const now = new Date();
  
  const startDateBound = new Date(2026, 0, 1);
  
  const diffInMs = now.getTime() - startDateBound.getTime();
  const weeksSinceStart = Math.max(1, Math.ceil(diffInMs / (7 * 24 * 60 * 60 * 1000)));
  
  for (let i = 0; i < weeksSinceStart; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (i * 7));
    
    if (d < startDateBound) break;
    
    const month = d.getMonth();
    const year = d.getFullYear();
    const day = d.getDate();
    const week = Math.ceil(day / 7);
    
    const startOfWeek = new Date(year, month, (week - 1) * 7 + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startStr = startOfWeek.toLocaleString("en-US", { month: "short", day: "numeric" });
    const endStr = endOfWeek.toLocaleString("en-US", { month: "short", day: "numeric" });
    
    const monthName = d.toLocaleString("en-US", { month: "long" });
    
    periods.push({
      label: `${monthName} ${year} · Week ${week}`,
      dateRange: `${startStr} - ${endStr}`
    });
  }
  return periods;
};

export const groupPeriodsByMonth = (periods: { label: string, dateRange: string }[]) => {
  const groups: Record<string, { label: string, dateRange: string }[]> = {};
  periods.forEach(p => {
    const monthYear = p.label.split(' · ')[0];
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(p);
  });
  return groups;
};

export const getPeriodDateRange = (period: string) => {
  const parts = period.split(' · ');
  if (parts.length < 2) return { from: undefined, to: undefined };
  
  const [monthYear, weekPart] = parts;
  const myParts = monthYear.split(' ');
  if (myParts.length < 2) return { from: undefined, to: undefined };
  
  const [monthName, yearStr] = myParts;
  const weekNum = parseInt(weekPart.replace('Week ', ''));
  const year = parseInt(yearStr);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months.indexOf(monthName);
  if (month === -1) return { from: undefined, to: undefined };

  const startDate = new Date(year, month, (weekNum - 1) * 7 + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    from: startDate.getTime(),
    to: endDate.getTime()
  };
};
