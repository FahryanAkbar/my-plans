import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubscribeProjectDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  readonly projectId!: string;
}
