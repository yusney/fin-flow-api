import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';

export class UpdateSubscriptionTemplateDto {
  @ApiPropertyOptional({ example: 'My Updated Service' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsOptional()
  @IsEnum(TemplateCategory)
  templateCategory?: TemplateCategory;

  @ApiPropertyOptional({ example: 'Updated description' })
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

  @ApiPropertyOptional({ example: 14.99 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultAmount?: number;

  @ApiPropertyOptional({ enum: BillingFrequency })
  @IsOptional()
  @IsEnum(BillingFrequency)
  defaultFrequency?: BillingFrequency;
}
