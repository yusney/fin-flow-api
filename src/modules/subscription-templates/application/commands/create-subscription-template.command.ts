import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';

export class CreateSubscriptionTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly userId: string,
    public readonly category: TemplateCategory,
    public readonly defaultFrequency: BillingFrequency,
    public readonly defaultAmount: number,
    public readonly description: string | null = null,
    public readonly iconUrl: string | null = null,
    public readonly serviceUrl: string | null = null,
  ) {}
}
