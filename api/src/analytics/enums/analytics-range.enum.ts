export enum AnalyticsRange {
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
}

export const DEFAULT_LATENCY_RANGE = AnalyticsRange.ONE_HOUR;
export const DEFAULT_UPTIME_STATS_RANGE = AnalyticsRange.TWENTY_FOUR_HOURS;
export const DEFAULT_DOWNTIME_RANGE = AnalyticsRange.SEVEN_DAYS;
export const DEFAULT_UPTIME_HISTORY_RANGE = AnalyticsRange.THIRTY_DAYS;
export const DEFAULT_TIMING_BREAKDOWN_RANGE = AnalyticsRange.TWENTY_FOUR_HOURS;
export const DEFAULT_NETWORK_FLOW_RANGE = AnalyticsRange.TWENTY_FOUR_HOURS;

export const STANDARD_ANALYTICS_RANGES = [
  AnalyticsRange.ONE_HOUR,
  AnalyticsRange.SIX_HOURS,
  AnalyticsRange.TWELVE_HOURS,
  AnalyticsRange.TWENTY_FOUR_HOURS,
  AnalyticsRange.SEVEN_DAYS,
  AnalyticsRange.THIRTY_DAYS,
] as const;

export const DOWNTIME_ANALYTICS_RANGES = [
  AnalyticsRange.TWENTY_FOUR_HOURS,
  AnalyticsRange.SEVEN_DAYS,
  AnalyticsRange.THIRTY_DAYS,
] as const;

export const UPTIME_HISTORY_WINDOW_BY_RANGE: Record<AnalyticsRange, string> = {
  [AnalyticsRange.ONE_HOUR]: '5m',
  [AnalyticsRange.SIX_HOURS]: '15m',
  [AnalyticsRange.TWELVE_HOURS]: '30m',
  [AnalyticsRange.TWENTY_FOUR_HOURS]: '1h',
  [AnalyticsRange.SEVEN_DAYS]: '12h',
  [AnalyticsRange.THIRTY_DAYS]: '1d',
};
