import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../domain/enums/subscription-type.enum';

export class CreateSubscriptionCommand {
  constructor(
    public readonly amount: number,
    public readonly description: string,
    public readonly billingDay: number,
    public readonly categoryId: string,
    public readonly userId: string,
    public readonly startDate: Date = new Date(),
    public readonly endDate: Date | null = null,
    public readonly frequency: BillingFrequency = BillingFrequency.MONTHLY,
    public readonly type: SubscriptionType = SubscriptionType.GENERAL,
    public readonly serviceUrl: string | null = null,
  ) {}
}
