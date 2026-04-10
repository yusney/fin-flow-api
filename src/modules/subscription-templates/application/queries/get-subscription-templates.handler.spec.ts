import { GetSubscriptionTemplatesHandler } from './get-subscription-templates.handler';
import { GetSubscriptionTemplatesQuery } from './get-subscription-templates.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';

const TEST_USER_ID = 'user-uuid-1234';

describe('GetSubscriptionTemplatesHandler', () => {
  let handler: GetSubscriptionTemplatesHandler;
  let repository: jest.Mocked<ISubscriptionTemplateRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllForUser: jest.fn(),
      findByIdForUser: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
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
    repository.findAllForUser.mockResolvedValue(templates);

    const query = new GetSubscriptionTemplatesQuery(TEST_USER_ID);
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(templates);
    expect(repository.findAllForUser).toHaveBeenCalledWith(
      TEST_USER_ID,
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
      }),
    ];
    repository.findAllForUser.mockResolvedValue(templates);

    const query = new GetSubscriptionTemplatesQuery(
      TEST_USER_ID,
      TemplateCategory.STREAMING,
    );
    const result = await handler.execute(query);

    expect(result).toHaveLength(1);
    expect(result).toEqual(templates);
    expect(repository.findAllForUser).toHaveBeenCalledWith(
      TEST_USER_ID,
      TemplateCategory.STREAMING,
    );
  });

  it('should return empty array when no templates exist', async () => {
    repository.findAllForUser.mockResolvedValue([]);

    const query = new GetSubscriptionTemplatesQuery(TEST_USER_ID);
    const result = await handler.execute(query);

    expect(result).toEqual([]);
    expect(repository.findAllForUser).toHaveBeenCalledWith(
      TEST_USER_ID,
      undefined,
    );
  });
});
