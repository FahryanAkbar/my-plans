import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { NodeType } from '../entities/network-node.entity';

export class UpdateNodeDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsEnum(NodeType)
  @IsOptional()
  nodeType?: NodeType;

  @IsUUID()
  @IsOptional()
  configId?: string | null;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;
}
