import { TemplateCategory } from '../enums/template-category.enum';
import { SubscriptionTemplate } from '../entities/subscription-template.entity';

export const SUBSCRIPTION_TEMPLATE_REPOSITORY = 'SUBSCRIPTION_TEMPLATE_REPOSITORY';

export interface ISubscriptionTemplateRepository {
  findById(id: string): Promise<SubscriptionTemplate | null>;
  findVisibleByUser(userId: string, category?: TemplateCategory): Promise<SubscriptionTemplate[]>;
  findByNameAndOwnership(name: string, ownership: string, userId?: string | null): Promise<SubscriptionTemplate | null>;
  save(template: SubscriptionTemplate): Promise<void>;
  update(template: SubscriptionTemplate): Promise<void>;
  delete(template: SubscriptionTemplate): Promise<void>;
}
