import { IsEnum, IsOptional } from 'class-validator';
import { AnalyticsRange } from '../enums/analytics-range.enum';

export class AnalyticsRangeQueryDto {
  @IsEnum(AnalyticsRange)
  @IsOptional()
  range?: AnalyticsRange;
}
