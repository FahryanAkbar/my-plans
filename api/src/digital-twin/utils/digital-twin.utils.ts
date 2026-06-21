import { TwinStatus } from '../interfaces/twin-object.interface';

export function calculateStatus(
  isUp: boolean | null,
  latencyMs: number,
  timeout: number,
): TwinStatus {
  if (isUp === null) return 'unknown';
  if (!isUp) return 'down';
  if (latencyMs > timeout * 0.8) return 'degraded';
  return 'up';
}

export function calculateHealth(
  uptimePercent: number,
  latencyMs: number,
  timeout: number,
): number {
  const uptimeScore = uptimePercent;
  const latencyScore = Math.max(0, 100 - (latencyMs / timeout) * 100);
  return Math.round(uptimeScore * 0.7 + latencyScore * 0.3);
}

export function calculateTrend(
  currentLatency: number,
  avgLatency: number,
): 'stable' | 'degrading' | 'recovering' {
  if (avgLatency === 0) return 'stable';
  const delta = (currentLatency - avgLatency) / avgLatency;
  if (delta > 0.2) return 'degrading';
  if (delta < -0.2) return 'recovering';
  return 'stable';
}
