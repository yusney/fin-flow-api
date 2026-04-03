import { GetSubscriptionTemplateHandler } from './get-subscription-template.handler';
import { GetSubscriptionTemplateQuery } from './get-subscription-template.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('GetSubscriptionTemplateHandler', () => {
  let handler: GetSubscriptionTemplateHandler;
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
    handler = new GetSubscriptionTemplateHandler(repository);
  });

  it('should return own USER template successfully', async () => {
    const template = SubscriptionTemplate.create({
      name: 'My Custom',
      description: null,
      iconUrl: null,
      serviceUrl: null,
      defaultAmount: 9.99,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.OTHER,
      ownership: TemplateOwnership.USER,
      userId: 'user-uuid',
    });
    repository.findById.mockResolvedValue(template);

    const query = new GetSubscriptionTemplateQuery('user-uuid', template.id);
    const result = await handler.execute(query);

    expect(result).toEqual(template);
    expect(repository.findById).toHaveBeenCalledWith(template.id);
  });

  it('should return GLOBAL template successfully', async () => {
    const template = SubscriptionTemplate.create({
      name: 'Netflix',
      description: null,
      iconUrl: null,
      serviceUrl: 'https://netflix.com',
      defaultAmount: 15.99,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.STREAMING,
      ownership: TemplateOwnership.GLOBAL,
      userId: null,
    });
    repository.findById.mockResolvedValue(template);

    const query = new GetSubscriptionTemplateQuery('user-uuid', template.id);
    const result = await handler.execute(query);

    expect(result).toEqual(template);
    expect(repository.findById).toHaveBeenCalledWith(template.id);
  });

  it('should throw NotFoundException when fetching another user USER template', async () => {
    const template = SubscriptionTemplate.create({
      name: 'Other User Template',
      description: null,
      iconUrl: null,
      serviceUrl: null,
      defaultAmount: 5.99,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.STREAMING,
      ownership: TemplateOwnership.USER,
      userId: 'other-user-uuid',
    });
    repository.findById.mockResolvedValue(template);

    const query = new GetSubscriptionTemplateQuery('user-uuid', template.id);

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when template not found', async () => {
    repository.findById.mockResolvedValue(null);

    const query = new GetSubscriptionTemplateQuery(
      'user-uuid',
      'non-existent-id',
    );

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });
});
