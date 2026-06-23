import { IsEnum, IsOptional } from 'class-validator';
import { SimulationRange } from '../enums/simulation-range.enum';

export class SimulationRangeQueryDto {
  @IsEnum(SimulationRange)
  @IsOptional()
  range?: SimulationRange;
}
