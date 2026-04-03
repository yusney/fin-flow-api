import { DeleteSubscriptionTemplateHandler } from './delete-subscription-template.handler';
import { DeleteSubscriptionTemplateCommand } from './delete-subscription-template.command';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { ForbiddenException } from '../../../../shared/domain/exceptions';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('DeleteSubscriptionTemplateHandler', () => {
  let handler: DeleteSubscriptionTemplateHandler;
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
    handler = new DeleteSubscriptionTemplateHandler(repository);
  });

  it('should delete own USER template successfully', async () => {
    const template = SubscriptionTemplate.create({
      name: 'My Netflix',
      description: null,
      iconUrl: null,
      serviceUrl: null,
      defaultAmount: 15.99,
      defaultFrequency: BillingFrequency.MONTHLY,
      category: TemplateCategory.STREAMING,
      ownership: TemplateOwnership.USER,
      userId: 'user-uuid',
    });
    repository.findById.mockResolvedValue(template);
    repository.delete.mockResolvedValue(undefined);

    const command = new DeleteSubscriptionTemplateCommand(
      template.id,
      'user-uuid',
    );
    await handler.execute(command);

    expect(repository.delete).toHaveBeenCalledWith(template);
  });

  it('should throw ForbiddenException when deleting a GLOBAL template', async () => {
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

    const command = new DeleteSubscriptionTemplateCommand(
      template.id,
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when deleting another user template', async () => {
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

    const command = new DeleteSubscriptionTemplateCommand(
      template.id,
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when template not found', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new DeleteSubscriptionTemplateCommand(
      'non-existent-id',
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
