import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';

export class UpdateSubscriptionTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly description?: string | null,
    public readonly iconUrl?: string | null,
    public readonly serviceUrl?: string | null,
    public readonly defaultAmount?: number,
    public readonly defaultFrequency?: BillingFrequency,
    public readonly category?: TemplateCategory,
  ) {}
}
