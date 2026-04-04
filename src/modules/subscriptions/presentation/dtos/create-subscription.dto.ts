import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Max,
  Min,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../domain/enums/subscription-type.enum';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 14.99 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Netflix' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 15, minimum: 1, maximum: 31 })
  @IsInt()
  @Min(1)
  @Max(31)
  billingDay: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Subscription start date (ISO 8601)',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2027-01-15',
    description: 'Subscription end date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: BillingFrequency,
    default: BillingFrequency.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingFrequency)
  frequency?: BillingFrequency;

  @ApiPropertyOptional({
    enum: SubscriptionType,
    default: SubscriptionType.GENERAL,
  })
  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @ApiPropertyOptional({
    example: 'https://netflix.com',
    description:
      'Service URL (required for DIGITAL_SERVICE, forbidden for GENERAL)',
  })
  @ValidateIf(
    (o) =>
      o.type === SubscriptionType.DIGITAL_SERVICE || o.serviceUrl !== undefined,
  )
  @IsUrl({}, { message: 'serviceUrl must be a valid URL' })
  serviceUrl?: string;
}
