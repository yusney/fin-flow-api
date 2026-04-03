import { CreateSubscriptionTemplateHandler } from './create-subscription-template.handler';
import { CreateSubscriptionTemplateCommand } from './create-subscription-template.command';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';

describe('CreateSubscriptionTemplateHandler', () => {
  let handler: CreateSubscriptionTemplateHandler;
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
    handler = new CreateSubscriptionTemplateHandler(repository);
  });

  it('should create a subscription template with ownership forced to USER and return { id }', async () => {
    repository.save.mockResolvedValue(undefined);

    const command = new CreateSubscriptionTemplateCommand(
      'My Netflix',
      'user-uuid',
      TemplateCategory.STREAMING,
      BillingFrequency.MONTHLY,
      15.99,
      'Personal Netflix template',
      'https://icon.url/netflix.png',
      'https://netflix.com',
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(repository.save).toHaveBeenCalledWith(
      expect.any(SubscriptionTemplate),
    );

    const savedTemplate = repository.save.mock.calls[0][0];
    expect(savedTemplate.ownership).toBe(TemplateOwnership.USER);
    expect(savedTemplate.userId).toBe('user-uuid');
  });

  it('should always force ownership to USER regardless of input', async () => {
    repository.save.mockResolvedValue(undefined);

    const command = new CreateSubscriptionTemplateCommand(
      'My Template',
      'user-uuid',
      TemplateCategory.MUSIC,
      BillingFrequency.MONTHLY,
      9.99,
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    const savedTemplate = repository.save.mock.calls[0][0];
    expect(savedTemplate.ownership).toBe(TemplateOwnership.USER);
    expect(savedTemplate.userId).toBe('user-uuid');
  });
});
