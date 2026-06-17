import { ProjectHealthData } from "@/hooks";
import { MetricStat } from "@/components";
import { TRESHOLD_GAUGE_SEGMENTS, NAME_GAUGE_SEGMENTS } from "@/lib";

export const getHealthStatusLabel =  (strength: number): string => {
  if (strength >= TRESHOLD_GAUGE_SEGMENTS.OPTIMAL) return NAME_GAUGE_SEGMENTS.OPTIMAL;
  if (strength >= TRESHOLD_GAUGE_SEGMENTS.AVERAGE) return NAME_GAUGE_SEGMENTS.AVERAGE;
  return NAME_GAUGE_SEGMENTS.CRITICAL;
}

export const formatHealthDetailedStats = (
  data: ProjectHealthData
): MetricStat[] => {
  const { totalTasks, doneCount, inProgressCount, overdueCount } = data;

  const calculatePercentage = ( value: number ) => 
    totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0

  return [
    {
      label: 'Completed',
      value: calculatePercentage(doneCount),
      trendDirection: 'up'
    },
    {
      label: 'In Progress',
      value: calculatePercentage(inProgressCount),
      trendDirection: 'neutral'
    },
    {
      label: 'Overdue',
      value: calculatePercentage(overdueCount),
      trendDirection: overdueCount > 0 ? 'down' : 'neutral'
    }
  ]
}