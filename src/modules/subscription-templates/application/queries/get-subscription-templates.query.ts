import { TemplateCategory } from '../../domain/enums/template-category.enum';

export class GetSubscriptionTemplatesQuery {
  constructor(
    public readonly userId: string,
    public readonly category?: TemplateCategory,
  ) {}
}
