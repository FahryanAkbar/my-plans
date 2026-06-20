export enum SimulationRange {
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
}

export const DEFAULT_SIMULATION_RANGE = SimulationRange.TWENTY_FOUR_HOURS;

export const SIMULATION_RANGES = [
  SimulationRange.ONE_HOUR,
  SimulationRange.SIX_HOURS,
  SimulationRange.TWELVE_HOURS,
  SimulationRange.TWENTY_FOUR_HOURS,
  SimulationRange.SEVEN_DAYS,
  SimulationRange.THIRTY_DAYS,
] as const;

export interface NetworkProfileSpec {
  rtt: number;
  bandwidth: number;
}

export const PROFILE_SPECS: Record<string, NetworkProfileSpec> = {
  WIFI: { rtt: 0, bandwidth: -1 },
  NETWORK_4G: { rtt: 20, bandwidth: (4 * 1024 * 1024) / 8 },   // 4 Mbps in B/s
  NETWORK_3G: { rtt: 300, bandwidth: (500 * 1024) / 8 },        // 500 Kbps in B/s
  FAST_3G: { rtt: 150, bandwidth: (1.5 * 1024 * 1024) / 8 },   // 1.5 Mbps in B/s
};
