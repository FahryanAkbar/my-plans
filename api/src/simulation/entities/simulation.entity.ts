export interface InfluxPuppeteerRow {
  configId: string;
  url: string;
  networkProfile: string;
  _time: string;
  _field: string;
  _value: string;
}

export interface InfluxBaseRow {
  configId: string;
  _time: string;
  _value: number;
}

export interface LatencyComparisonPoint {
  time: string;
  realLatency: number;
  predictedLatency: number;
}

export interface LatencyComparisonResult {
  configId: string;
  url: string;
  networkProfile: string;
  series: LatencyComparisonPoint[];
}
