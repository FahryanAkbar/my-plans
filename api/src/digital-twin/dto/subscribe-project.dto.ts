import { IsNotEmpty, IsString } from 'class-validator';

export class SubscribeProjectDto {
  @IsNotEmpty()
  @IsString()
  readonly projectId!: string;
}
