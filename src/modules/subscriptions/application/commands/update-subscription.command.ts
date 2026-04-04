import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../domain/enums/subscription-type.enum';

export class UpdateSubscriptionCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount?: number,
    public readonly description?: string,
    public readonly billingDay?: number,
    public readonly frequency?: BillingFrequency,
    public readonly type?: SubscriptionType,
    public readonly serviceUrl?: string | null,
  ) {}
}
