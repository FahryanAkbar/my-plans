import {
  IsString,
  IsUUID,
  IsUrl,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Expose } from 'class-transformer';

export type TwinStatus = 'up' | 'down' | 'degraded' | 'unknown';
export const TwinStatusValues: TwinStatus[] = [
  'up',
  'down',
  'degraded',
  'unknown',
];

export type TwinTrend = 'stable' | 'degrading' | 'recovering';
export const TwinTrendValues: TwinTrend[] = [
  'stable',
  'degrading',
  'recovering',
];

export class TwinObject {
  @Expose()
  @IsUUID('4')
  readonly configId: string;

  @Expose()
  @IsString()
  readonly projectId: string;

  @Expose()
  @IsUrl()
  readonly url: string;

  @Expose()
  @IsString()
  readonly name: string;

  @Expose()
  @IsEnum(TwinStatusValues)
  readonly status: TwinStatus;

  @Expose()
  @IsNumber()
  @Min(0)
  readonly latencyMs: number;

  @Expose()
  @IsDateString()
  readonly lastCheckedAt: string;

  @Expose()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly uptimePercent: number;

  @Expose()
  @IsNumber()
  @Min(0)
  readonly avgLatencyMs: number;

  @Expose()
  @IsNumber()
  @Min(0)
  readonly downtimeIncidents: number;

  @Expose()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly twinHealth: number;

  @Expose()
  @IsEnum(TwinTrendValues)
  readonly trend: TwinTrend;

  constructor(init?: Partial<TwinObject>) {
    this.configId = init?.configId ?? '';
    this.projectId = init?.projectId ?? '';
    this.url = init?.url ?? '';
    this.name = init?.name ?? '';
    this.status = init?.status ?? 'unknown';
    this.latencyMs = init?.latencyMs ?? 0;
    this.lastCheckedAt = init?.lastCheckedAt ?? '';
    this.uptimePercent = init?.uptimePercent ?? 100;
    this.avgLatencyMs = init?.avgLatencyMs ?? 0;
    this.downtimeIncidents = init?.downtimeIncidents ?? 0;
    this.twinHealth = init?.twinHealth ?? 100;
    this.trend = init?.trend ?? 'stable';
  }
}
