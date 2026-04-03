import { GetSubscriptionsHandler } from './get-subscriptions.handler';
import { GetSubscriptionsQuery } from './get-subscriptions.query';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

describe('GetSubscriptionsHandler', () => {
  let handler: GetSubscriptionsHandler;
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
    handler = new GetSubscriptionsHandler(subscriptionRepository);
  });

  it('should return subscriptions for the given userId', async () => {
    const subscriptions = [
      Subscription.create({
        amount: 9.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-1',
        userId: 'user-uuid',
        startDate: new Date(),
      }),
      Subscription.create({
        amount: 14.99,
        description: 'Spotify',
        billingDay: 1,
        categoryId: 'cat-2',
        userId: 'user-uuid',
        startDate: new Date(),
      }),
    ];
    subscriptionRepository.findByUserId.mockResolvedValue(subscriptions);

    const query = new GetSubscriptionsQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(subscriptions);
    expect(subscriptionRepository.findByUserId).toHaveBeenCalledWith(
      'user-uuid',
    );
  });

  it('should return empty array when user has no subscriptions', async () => {
    subscriptionRepository.findByUserId.mockResolvedValue([]);

    const query = new GetSubscriptionsQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toEqual([]);
  });
});
