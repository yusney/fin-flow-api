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
  @ApiProperty({ example: 'My Streaming Service' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: TemplateCategory, example: TemplateCategory.STREAMING })
  @IsEnum(TemplateCategory)
  templateCategory: TemplateCategory;

  @ApiPropertyOptional({ example: 'My personal streaming service' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  serviceUrl?: string;

  @ApiPropertyOptional({ example: 9.99, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultAmount?: number;

  @ApiPropertyOptional({
    enum: BillingFrequency,
    default: BillingFrequency.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingFrequency)
  defaultFrequency?: BillingFrequency;
}
