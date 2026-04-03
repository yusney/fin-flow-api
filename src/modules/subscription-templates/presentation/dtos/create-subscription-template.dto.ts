import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';

export class CreateSubscriptionTemplateDto {
  @ApiProperty({ example: 'Netflix' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Video streaming service' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/netflix-icon.png' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'https://netflix.com' })
  @IsOptional()
  @IsUrl()
  serviceUrl?: string;

  @ApiProperty({ example: 14.99 })
  @IsNumber()
  @IsPositive()
  defaultAmount: number;

  @ApiProperty({ enum: BillingFrequency, default: BillingFrequency.MONTHLY })
  @IsEnum(BillingFrequency)
  defaultFrequency: BillingFrequency;

  @ApiProperty({ enum: TemplateCategory, example: TemplateCategory.STREAMING })
  @IsEnum(TemplateCategory)
  category: TemplateCategory;
}
