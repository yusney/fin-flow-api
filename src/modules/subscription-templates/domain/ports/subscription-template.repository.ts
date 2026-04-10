import { TemplateCategory } from '../enums/template-category.enum';
import { SubscriptionTemplate } from '../entities/subscription-template.entity';

export const SUBSCRIPTION_TEMPLATE_REPOSITORY =
  'SUBSCRIPTION_TEMPLATE_REPOSITORY';

export interface ISubscriptionTemplateRepository {
  findById(id: string): Promise<SubscriptionTemplate | null>;
  findAll(category?: TemplateCategory): Promise<SubscriptionTemplate[]>;
  findAllForUser(
    userId: string,
    category?: TemplateCategory,
  ): Promise<SubscriptionTemplate[]>;
  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<SubscriptionTemplate | null>;
  findByName(name: string): Promise<SubscriptionTemplate | null>;
  save(template: SubscriptionTemplate): Promise<void>;
  delete(template: SubscriptionTemplate): Promise<void>;
}
