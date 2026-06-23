import {
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { TwinObject } from '../interfaces/twin-object.interface';

export class TwinStateDto {
  @Expose()
  @IsString()
  readonly projectId: string;

  @Expose()
  @IsString()
  readonly projectName: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TwinObject)
  readonly twins: TwinObject[];

  @Expose()
  @IsDateString()
  readonly snapshotAt: string;

  constructor(init?: Partial<TwinStateDto>) {
    this.projectId = init?.projectId ?? '';
    this.projectName = init?.projectName ?? '';
    this.twins = init?.twins ?? [];
    this.snapshotAt = init?.snapshotAt ?? new Date().toISOString();
  }
}
