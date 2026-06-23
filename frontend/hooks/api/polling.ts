export const MONITORING_POLL_INTERVAL_MS = 30_000;

export function shouldSkipBackgroundPoll() {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}
