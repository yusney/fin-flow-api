import { ApiProperty } from '@nestjs/swagger';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../../subscriptions/domain/enums/subscription-type.enum';

export class PrefillResponseDto {
  @ApiProperty({ example: 15.99 })
  amount: number;

  @ApiProperty({ example: 'Netflix' })
  description: string;

  @ApiProperty({ enum: BillingFrequency })
  frequency: BillingFrequency;

  @ApiProperty({ example: 'https://www.netflix.com', nullable: true })
  serviceUrl: string | null;

  @ApiProperty({ enum: SubscriptionType })
  type: SubscriptionType;
}
