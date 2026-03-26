import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  @IsString()
  @IsIn(['income', 'expense'])
  type: string;
}
