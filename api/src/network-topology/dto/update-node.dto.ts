import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { NodeType } from '../entities/network-node.entity';

export class UpdateNodeDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsEnum(NodeType)
  @IsOptional()
  nodeType?: NodeType;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;
}
