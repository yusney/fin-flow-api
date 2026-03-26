jest.mock('@mikro-orm/core', () => ({
  EntityManager: jest.fn(),
}));

jest.mock('@nestjs/common', () => ({
  Injectable: () => (target: any) => target,
}));

import { MikroOrmSubscriptionRepository } from './mikro-orm-subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

describe('MikroOrmSubscriptionRepository', () => {
  let repository: MikroOrmSubscriptionRepository;
  let em: { find: jest.Mock; findOne: jest.Mock; persist: jest.Mock; flush: jest.Mock };

  beforeEach(() => {
    em = {
      find: jest.fn(),
      findOne: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
    };
    repository = new MikroOrmSubscriptionRepository(em as any);
  });

  describe('findActiveDueToday', () => {
    it('should filter by exact billingDay when not last day of month', async () => {
      em.find.mockResolvedValue([]);

      await repository.findActiveDueToday(15, false);

      expect(em.find).toHaveBeenCalledWith(Subscription, {
        isActive: true,
        billingDay: 15,
      });
    });

    it('should filter by billingDay >= day when last day of month', async () => {
      em.find.mockResolvedValue([]);

      await repository.findActiveDueToday(28, true);

      expect(em.find).toHaveBeenCalledWith(Subscription, {
        isActive: true,
        billingDay: { $gte: 28 },
      });
    });

    it('should return subscriptions matching the filter', async () => {
      const sub = Subscription.create({
        amount: 9.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-1',
        userId: 'user-1',
        startDate: new Date(),
      });
      em.find.mockResolvedValue([sub]);

      const result = await repository.findActiveDueToday(15, false);

      expect(result).toEqual([sub]);
    });

    it('should catch subscriptions with billingDay 29-31 on Feb 28', async () => {
      em.find.mockResolvedValue([]);

      await repository.findActiveDueToday(28, true);

      expect(em.find).toHaveBeenCalledWith(Subscription, {
        isActive: true,
        billingDay: { $gte: 28 },
      });
    });
  });
});
