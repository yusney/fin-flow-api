import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeDto {
  @ApiPropertyOptional({ description: 'New display name', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    description: 'Current password (required to change password)',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  currentPassword?: string;

  @ApiPropertyOptional({ description: 'New password', minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
