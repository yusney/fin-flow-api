import { GetSubscriptionTemplateHandler } from './get-subscription-template.handler';
import { GetSubscriptionTemplateQuery } from './get-subscription-template.query';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { NotFoundException } from '../../../../shared/domain/exceptions';

const TEST_USER_ID = 'user-uuid-1234';

describe('GetSubscriptionTemplateHandler', () => {
  let handler: GetSubscriptionTemplateHandler;
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
    repository.findByIdForUser.mockResolvedValue(template);

    const query = new GetSubscriptionTemplateQuery(template.id, TEST_USER_ID);
    const result = await handler.execute(query);

    expect(result).toEqual(template);
    expect(repository.findByIdForUser).toHaveBeenCalledWith(
      template.id,
      TEST_USER_ID,
    );
  });

  it('should throw NotFoundException when template not found', async () => {
    repository.findByIdForUser.mockResolvedValue(null);

    const query = new GetSubscriptionTemplateQuery(
      'non-existent-id',
      TEST_USER_ID,
    );

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(repository.findByIdForUser).toHaveBeenCalledWith(
      'non-existent-id',
      TEST_USER_ID,
    );
  });
});
