import {
  IsString,
  IsUrl,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Environment } from '../enums/environment.enum';
import { NetworkProfile } from '../enums/network-profile.enum';
import { Engine } from '../enums/engine.enum';

export class UpdateMonitoringConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl({}, { message: 'Must be a valid target URL' })
  @IsOptional()
  url?: string;

  @IsEnum(Environment)
  @IsOptional()
  environment?: Environment;

  @IsNumber()
  @Min(5000, { message: 'Interval must be at least 5000ms (5 seconds)' })
  @IsOptional()
  interval?: number;

  @IsEnum(NetworkProfile)
  @IsOptional()
  networkProfile?: NetworkProfile;

  @IsEnum(Engine)
  @IsOptional()
  engine?: Engine;

  @IsNumber()
  @Min(1000)
  @IsOptional()
  timeout?: number;

  @IsNumber()
  @IsOptional()
  expectedStatus?: number;

  @IsBoolean()
  @IsOptional()
  checkSsl?: boolean;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
