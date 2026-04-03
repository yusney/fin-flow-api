import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
  IsOptional,
  IsEnum,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../domain/enums/subscription-type.enum';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: 17.99 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ example: 'Netflix Premium' })
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 15, minimum: 1, maximum: 31 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  billingDay?: number;

  @ApiPropertyOptional({ enum: BillingFrequency })
  @IsOptional()
  @IsEnum(BillingFrequency)
  frequency?: BillingFrequency;

  @ApiPropertyOptional({ enum: SubscriptionType })
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
