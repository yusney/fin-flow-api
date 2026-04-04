import { ToggleSubscriptionHandler } from './toggle-subscription.handler';
import { ToggleSubscriptionCommand } from './toggle-subscription.command';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('ToggleSubscriptionHandler', () => {
  let handler: ToggleSubscriptionHandler;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveDueToday: jest.fn(),
      findHistoryByRootId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    handler = new ToggleSubscriptionHandler(subscriptionRepository);
  });

  it('should toggle subscription and return full plain object', async () => {
    const subscription = Subscription.create({
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'category-uuid',
      userId: 'user-uuid',
      startDate: new Date(),
    });
    expect(subscription.isActive).toBe(true);
    subscriptionRepository.findById.mockResolvedValue(subscription);
    subscriptionRepository.update.mockResolvedValue(undefined);

    const command = new ToggleSubscriptionCommand(subscription.id, 'user-uuid');
    const result = await handler.execute(command);

    expect(result).toMatchObject({
      id: subscription.id,
      isActive: false,
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'category-uuid',
      userId: 'user-uuid',
    });
    expect(subscriptionRepository.update).toHaveBeenCalledWith(subscription);
  });

  it('should throw NotFoundException when subscription not found', async () => {
    subscriptionRepository.findById.mockResolvedValue(null);

    const command = new ToggleSubscriptionCommand(
      'non-existent-id',
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when subscription belongs to another user', async () => {
    const subscription = Subscription.create({
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'category-uuid',
      userId: 'other-user-uuid',
      startDate: new Date(),
    });
    subscriptionRepository.findById.mockResolvedValue(subscription);

    const command = new ToggleSubscriptionCommand(subscription.id, 'user-uuid');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
