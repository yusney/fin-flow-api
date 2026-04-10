import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';

export class CreateSubscriptionTemplateCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly templateCategory: TemplateCategory,
    public readonly description?: string | null,
    public readonly iconUrl?: string | null,
    public readonly serviceUrl?: string | null,
    public readonly defaultAmount?: number,
    public readonly defaultFrequency?: BillingFrequency,
  ) {}
}
