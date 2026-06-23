import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { RelationType } from '../entities/network-edge.entity';

export class CreateEdgeDto {
  @IsUUID()
  sourceId!: string;

  @IsUUID()
  targetId!: string;

  @IsEnum(RelationType)
  @IsOptional()
  relationType?: RelationType;
}
