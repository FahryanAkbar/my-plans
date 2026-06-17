import { GaugeSegment } from "@/components";

export const NAME_GAUGE_SEGMENTS = {
  CRITICAL: 'Critical',
  AVERAGE: 'Average',
  OPTIMAL: 'Optimal',
} as const

export const COLOR_GAUGE_SEGMENTS = {
  CRITICAL: 'hsl(var(--destructive) / 0.8)',
  AVERAGE: 'hsl(var(--destructive) / 0.8)',
  OPTIMAL: 'hsl(var(--destructive) / 0.8)',
} as const

export const TRESHOLD_GAUGE_SEGMENTS = {
  OPTIMAL: 40,
  AVERAGE: 70,
  CRITICAL: 100,
} as const

export const HEALTH_GAUGE_SEGMENTS: GaugeSegment[] = [
  {
    name: NAME_GAUGE_SEGMENTS.CRITICAL,
    value: TRESHOLD_GAUGE_SEGMENTS.CRITICAL,
    color: COLOR_GAUGE_SEGMENTS.CRITICAL
  },
  {
    name: NAME_GAUGE_SEGMENTS.AVERAGE,
    value: TRESHOLD_GAUGE_SEGMENTS.AVERAGE,
    color: COLOR_GAUGE_SEGMENTS.AVERAGE
  },
  {
    name: NAME_GAUGE_SEGMENTS.OPTIMAL,
    value: TRESHOLD_GAUGE_SEGMENTS.OPTIMAL,
    color: COLOR_GAUGE_SEGMENTS.OPTIMAL
  }
]

export type NameGaugeSegments = 
  (typeof NAME_GAUGE_SEGMENTS)[keyof typeof NAME_GAUGE_SEGMENTS]

export type ColorGaugeSegments = 
  (typeof COLOR_GAUGE_SEGMENTS)[keyof typeof COLOR_GAUGE_SEGMENTS]

export type TresholdGaugeSegments = 
  (typeof TRESHOLD_GAUGE_SEGMENTS)[keyof typeof TRESHOLD_GAUGE_SEGMENTS]