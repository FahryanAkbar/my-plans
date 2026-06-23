import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { NodeType } from '../entities/network-node.entity';

export class CreateNodeDto {
  @IsString()
  label!: string;

  @IsEnum(NodeType)
  @IsOptional()
  nodeType?: NodeType;

  @IsUUID()
  @IsOptional()
  configId?: string;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;
}
