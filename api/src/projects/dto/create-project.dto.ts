import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  id!: string; // The projectId from Convex

  @IsString()
  @IsNotEmpty()
  name!: string;
}
