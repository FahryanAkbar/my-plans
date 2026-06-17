export const WORKLOAD_LABELS = {
  OVERLOADED: 'overloaded',
  BUSY: 'busy',
  AVAILABLE: 'available',
} as const

export const WORKLOAD_COLORS = {
  OVERLOADED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  BUSY: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  AVAILABLE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
} as const

export const WORKLOAD_CONFIGURATION = {
  OVERLOADED: {
    label: WORKLOAD_LABELS.OVERLOADED,
    color: WORKLOAD_COLORS.OVERLOADED
  },
  BUSY: {
    label: WORKLOAD_LABELS.BUSY,
    color: WORKLOAD_COLORS.BUSY
  },
  AVAILABLE: {
    label: WORKLOAD_LABELS.AVAILABLE,
    color: WORKLOAD_COLORS.AVAILABLE
  },
}

export type WorkloadLabels =
  (typeof WORKLOAD_LABELS)[keyof typeof WORKLOAD_LABELS]

export type WorkloadColors =
  (typeof WORKLOAD_COLORS)[keyof typeof WORKLOAD_COLORS]

export type WorkloadConfiguration =
  (typeof WORKLOAD_CONFIGURATION)[keyof typeof WORKLOAD_CONFIGURATION]