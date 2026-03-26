import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Lunch' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2026-03-23' })
  @IsDateString()
  date: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;
}
