import { GetSubscriptionTemplatesHandler } from './get-subscription-templates.handler';
import { GetSubscriptionTemplatesQuery } from './get-subscription-templates.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';

describe('GetSubscriptionTemplatesHandler', () => {
  let handler: GetSubscriptionTemplatesHandler;
  let repository: jest.Mocked<ISubscriptionTemplateRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    };
    handler = new GetSubscriptionTemplatesHandler(repository);
  });

  it('should return all templates without category filter', async () => {
    const templates = [
      SubscriptionTemplate.create({
        name: 'Netflix',
        description: null,
        iconUrl: null,
        serviceUrl: 'https://netflix.com',
        defaultAmount: 15.99,
        defaultFrequency: BillingFrequency.MONTHLY,
        category: TemplateCategory.STREAMING,
      }),
      SubscriptionTemplate.create({
        name: 'Spotify',
        description: null,
        iconUrl: null,
        serviceUrl: 'https://spotify.com',
        defaultAmount: 9.99,
        defaultFrequency: BillingFrequency.MONTHLY,
        category: TemplateCategory.MUSIC,
      }),
    ];
    repository.findAll.mockResolvedValue(templates);

    const query = new GetSubscriptionTemplatesQuery();
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(templates);
    expect(repository.findAll).toHaveBeenCalledWith(undefined);
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
      }),
    ];
    repository.findAll.mockResolvedValue(templates);

    const query = new GetSubscriptionTemplatesQuery(TemplateCategory.STREAMING);
    const result = await handler.execute(query);

    expect(result).toHaveLength(1);
    expect(result).toEqual(templates);
    expect(repository.findAll).toHaveBeenCalledWith(TemplateCategory.STREAMING);
  });

  it('should return empty array when no templates exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const query = new GetSubscriptionTemplatesQuery();
    const result = await handler.execute(query);

    expect(result).toEqual([]);
    expect(repository.findAll).toHaveBeenCalledWith(undefined);
  });
});
