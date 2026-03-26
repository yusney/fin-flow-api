import { IsInt, IsNumber, IsPositive, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @IsPositive()
  limitAmount: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;
}
