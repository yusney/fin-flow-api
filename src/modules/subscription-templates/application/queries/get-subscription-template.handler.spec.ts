import { GetSubscriptionTemplateHandler } from './get-subscription-template.handler';
import { GetSubscriptionTemplateQuery } from './get-subscription-template.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('GetSubscriptionTemplateHandler', () => {
  let handler: GetSubscriptionTemplateHandler;
  let repository: jest.Mocked<ISubscriptionTemplateRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    };
    handler = new GetSubscriptionTemplateHandler(repository);
  });

  it('should return a template successfully', async () => {
    const template = SubscriptionTemplate.create({
      name: 'Netflix',
      description: null,
      iconUrl: null,
      serviceUrl: 'https://netflix.com',
      defaultAmount: 15.99,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.STREAMING,
    });
    repository.findById.mockResolvedValue(template);

    const query = new GetSubscriptionTemplateQuery(template.id);
    const result = await handler.execute(query);

    expect(result).toEqual(template);
    expect(repository.findById).toHaveBeenCalledWith(template.id);
  });

  it('should throw NotFoundException when template not found', async () => {
    repository.findById.mockResolvedValue(null);

    const query = new GetSubscriptionTemplateQuery('non-existent-id');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
