import { UpdateSubscriptionTemplateHandler } from './update-subscription-template.handler';
import { UpdateSubscriptionTemplateCommand } from './update-subscription-template.command';
import { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';
import { TemplateCategory } from '../../domain/enums/template-category.enum';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { ForbiddenException } from '../../../../shared/domain/exceptions';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('UpdateSubscriptionTemplateHandler', () => {
  let handler: UpdateSubscriptionTemplateHandler;
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
    handler = new UpdateSubscriptionTemplateHandler(repository);
  });

  it('should update own USER template successfully', async () => {
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
    repository.update.mockResolvedValue(undefined);

    const command = new UpdateSubscriptionTemplateCommand(
      template.id,
      'user-uuid',
      'Updated Netflix',
    );
    const result = await handler.execute(command);

    expect(result).toMatchObject({
      id: template.id,
      name: 'Updated Netflix',
      category: TemplateCategory.STREAMING,
      ownership: TemplateOwnership.USER,
      userId: 'user-uuid',
      defaultAmount: 15.99,
      defaultFrequency: BillingFrequency.MONTHLY,
    });
    expect(repository.update).toHaveBeenCalledWith(template);
    expect(template.name).toBe('Updated Netflix');
  });

  it('should throw ForbiddenException when updating a GLOBAL template', async () => {
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

    const command = new UpdateSubscriptionTemplateCommand(
      template.id,
      'user-uuid',
      'Hacked Netflix',
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when updating another user template', async () => {
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

    const command = new UpdateSubscriptionTemplateCommand(
      template.id,
      'user-uuid',
      'Stolen Template',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when template not found', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new UpdateSubscriptionTemplateCommand(
      'non-existent-id',
      'user-uuid',
      'Ghost Template',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
