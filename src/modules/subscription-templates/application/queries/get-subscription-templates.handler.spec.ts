import { GetSubscriptionTemplatesHandler } from './get-subscription-templates.handler';
import { GetSubscriptionTemplatesQuery } from './get-subscription-templates.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';

describe('GetSubscriptionTemplatesHandler', () => {
  let handler: GetSubscriptionTemplatesHandler;
  let repository: jest.Mocked<ISubscriptionTemplateRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findVisibleByUser: jest.fn(),
      findByNameAndOwnership: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    handler = new GetSubscriptionTemplatesHandler(repository);
  });

  it('should return all visible templates for a user without category filter', async () => {
    const templates = [
      SubscriptionTemplate.create({
        name: 'Netflix',
        description: null,
        iconUrl: null,
        serviceUrl: 'https://netflix.com',
        defaultAmount: 15.99,
        defaultFrequency: BillingFrequency.MONTHLY,
        category: TemplateCategory.STREAMING,
        ownership: TemplateOwnership.GLOBAL,
        userId: null,
      }),
      SubscriptionTemplate.create({
        name: 'My Custom',
        description: null,
        iconUrl: null,
        serviceUrl: null,
        defaultAmount: 9.99,
        defaultFrequency: BillingFrequency.MONTHLY,
        category: TemplateCategory.OTHER,
        ownership: TemplateOwnership.USER,
        userId: 'user-uuid',
      }),
    ];
    repository.findVisibleByUser.mockResolvedValue(templates);

    const query = new GetSubscriptionTemplatesQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(templates);
    expect(repository.findVisibleByUser).toHaveBeenCalledWith(
      'user-uuid',
      undefined,
    );
  });

  it('should return templates filtered by category', async () => {
    const templates = [
      SubscriptionTemplate.create({
        name: 'Netflix',
        description: null,
        iconUrl: null,
        serviceUrl: 'https://netflix.com',
        defaultAmount: 15.99,
        defaultFrequency: BillingFrequency.MONTHLY,
        category: TemplateCategory.STREAMING,
        ownership: TemplateOwnership.GLOBAL,
        userId: null,
      }),
    ];
    repository.findVisibleByUser.mockResolvedValue(templates);

    const query = new GetSubscriptionTemplatesQuery(
      'user-uuid',
      TemplateCategory.STREAMING,
    );
    const result = await handler.execute(query);

    expect(result).toHaveLength(1);
    expect(result).toEqual(templates);
    expect(repository.findVisibleByUser).toHaveBeenCalledWith(
      'user-uuid',
      TemplateCategory.STREAMING,
    );
  });

  it('should return empty array when no templates are visible', async () => {
    repository.findVisibleByUser.mockResolvedValue([]);

    const query = new GetSubscriptionTemplatesQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toEqual([]);
  });
});
