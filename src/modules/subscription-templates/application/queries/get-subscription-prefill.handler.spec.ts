import { GetSubscriptionPrefillHandler } from './get-subscription-prefill.handler';
import { GetSubscriptionPrefillQuery } from './get-subscription-prefill.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../../subscriptions/domain/enums/subscription-type.enum';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('GetSubscriptionPrefillHandler', () => {
  let handler: GetSubscriptionPrefillHandler;
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
    handler = new GetSubscriptionPrefillHandler(repository);
  });

  it('should return prefill data for a template with serviceUrl', async () => {
    const template = SubscriptionTemplate.create({
      name: 'Netflix',
      description: 'Streaming service',
      iconUrl: 'https://example.com/icon.png',
      serviceUrl: 'https://netflix.com',
      defaultAmount: 15.99,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.STREAMING,
    });
    repository.findById.mockResolvedValue(template);

    const query = new GetSubscriptionPrefillQuery(template.id);
    const result = await handler.execute(query);

    expect(result).toEqual({
      amount: 15.99,
      description: 'Netflix',
      frequency: BillingFrequency.MONTHLY,
      serviceUrl: 'https://netflix.com',
      type: SubscriptionType.DIGITAL_SERVICE,
    });
    expect(repository.findById).toHaveBeenCalledWith(template.id);
  });

  it('should return prefill data for a template without serviceUrl', async () => {
    const template = SubscriptionTemplate.create({
      name: 'Gym Membership',
      description: null,
      iconUrl: null,
      serviceUrl: null,
      defaultAmount: 50.0,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.FITNESS_HEALTH,
    });
    repository.findById.mockResolvedValue(template);

    const query = new GetSubscriptionPrefillQuery(template.id);
    const result = await handler.execute(query);

    expect(result).toEqual({
      amount: 50.0,
      description: 'Gym Membership',
      frequency: BillingFrequency.MONTHLY,
      serviceUrl: null,
      type: SubscriptionType.GENERAL,
    });
  });

  it('should throw NotFoundException when template not found', async () => {
    repository.findById.mockResolvedValue(null);

    const query = new GetSubscriptionPrefillQuery('non-existent-id');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });
});
