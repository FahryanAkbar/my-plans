"use client";

import { ProjectHealthData } from "@/hooks";
import { STATUS_CONFIGURATION, TREND_CHART_DIRECTION } from "@/lib";
import { GaugeValueSegment, MetricStat } from "@/components";

export const formatProjectHealthSegments = (
  statusDistribution: ProjectHealthData['statusDistribution'],
  counts: Pick<ProjectHealthData, 'doneCount' | 'inProgressCount' | 'inReviewCount' | 'blockedCount' | 'todoCount' | 'overdueCount'>
): GaugeValueSegment[] => {
  return [
    {
      name: STATUS_CONFIGURATION.DONE.label,
      value: statusDistribution.done,
      count: counts.doneCount,
      color: STATUS_CONFIGURATION.DONE.color
    },
    {
      name: STATUS_CONFIGURATION.IN_REVIEW.label,
      value: statusDistribution.inReview,
      count: counts.inReviewCount,
      color: STATUS_CONFIGURATION.IN_REVIEW.color
    },
    {
      name: STATUS_CONFIGURATION.IN_PROGRESS.label,
      value: statusDistribution.inProgress,
      count: counts.inProgressCount,
      color: STATUS_CONFIGURATION.IN_PROGRESS.color
    },
    {
      name: STATUS_CONFIGURATION.BLOCKED.label,
      value: statusDistribution.blocked,
      count: counts.blockedCount,
      color: STATUS_CONFIGURATION.BLOCKED.color
    },
    {
      name: STATUS_CONFIGURATION.TODO.label,
      value: statusDistribution.todo,
      count: counts.todoCount,
      color: STATUS_CONFIGURATION.TODO.color
    },
  ]
}

export const formatProjectHealthStats = (
  data: ProjectHealthData
): MetricStat[] => {
  return [
    {
      label: STATUS_CONFIGURATION.DONE.label,
      value: data.doneCount,
      trendDirection: TREND_CHART_DIRECTION.UP
    },
    {
      label: STATUS_CONFIGURATION.IN_REVIEW.label,
      value: data.inReviewCount,
      trendDirection: TREND_CHART_DIRECTION.NEUTRAL
    },
    {
      label: STATUS_CONFIGURATION.IN_PROGRESS.label,
      value: data.inProgressCount,
      trendDirection: TREND_CHART_DIRECTION.NEUTRAL
    },
    {
      label: STATUS_CONFIGURATION.BLOCKED.label,
      value: data.blockedCount,
      trendDirection: TREND_CHART_DIRECTION.NEUTRAL
    },
    {
      label: STATUS_CONFIGURATION.TODO.label,
      value: data.todoCount,
      trendDirection: TREND_CHART_DIRECTION.UP
    },
    {
      label: STATUS_CONFIGURATION.OVERDUE.label,
      value: data.overdueCount,
      trendDirection: TREND_CHART_DIRECTION.DOWN
    }
  ]
}