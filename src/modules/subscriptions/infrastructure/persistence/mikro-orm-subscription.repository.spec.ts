jest.mock('@mikro-orm/core', () => ({
  EntityManager: jest.fn(),
}));

jest.mock('@nestjs/common', () => ({
  Injectable: () => (target: any) => target,
}));

import { EntityManager } from '@mikro-orm/core';
import { MikroOrmSubscriptionRepository } from './mikro-orm-subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

describe('MikroOrmSubscriptionRepository', () => {
  let repository: MikroOrmSubscriptionRepository;
  let em: {
    find: jest.Mock;
    findOne: jest.Mock;
    persist: jest.Mock;
    flush: jest.Mock;
  };

  beforeEach(() => {
    em = {
      find: jest.fn(),
      findOne: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
    };
    repository = new MikroOrmSubscriptionRepository(
      em as unknown as EntityManager,
    );
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

  describe('findByUserId', () => {
    it('should filter by userId and endDate IS NULL (active versions only)', async () => {
      em.find.mockResolvedValue([]);

      await repository.findByUserId('user-1');

      expect(em.find).toHaveBeenCalledWith(
        Subscription,
        { userId: 'user-1', endDate: null },
        { orderBy: { createdAt: 'DESC' } },
      );
    });

    it('should exclude subscriptions with endDate set (closed versions)', async () => {
      const activeSub = Subscription.create({
        amount: 9.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-1',
        userId: 'user-1',
        startDate: new Date(),
      });
      em.find.mockResolvedValue([activeSub]);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual([activeSub]);
      expect(em.find).toHaveBeenCalledWith(
        Subscription,
        { userId: 'user-1', endDate: null },
        { orderBy: { createdAt: 'DESC' } },
      );
    });
  });

  describe('findHistoryByRootId', () => {
    it('should query by id OR parentId matching rootId', async () => {
      em.find.mockResolvedValue([]);

      await repository.findHistoryByRootId('root-abc');

      expect(em.find).toHaveBeenCalledWith(
        Subscription,
        { $or: [{ id: 'root-abc' }, { parentId: 'root-abc' }] },
        { orderBy: { startDate: 'ASC' } },
      );
    });

    it('should return all versions ordered by startDate ASC', async () => {
      const v1 = Subscription.create({
        amount: 9.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-1',
        userId: 'user-1',
        startDate: new Date('2026-01-01'),
        id: 'root-abc',
      });
      const v2 = Subscription.create({
        amount: 14.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-1',
        userId: 'user-1',
        startDate: new Date('2026-03-01'),
        parentId: 'root-abc',
      });
      em.find.mockResolvedValue([v1, v2]);

      const result = await repository.findHistoryByRootId('root-abc');

      expect(result).toEqual([v1, v2]);
      expect(em.find).toHaveBeenCalledWith(
        Subscription,
        { $or: [{ id: 'root-abc' }, { parentId: 'root-abc' }] },
        { orderBy: { startDate: 'ASC' } },
      );
    });
  });
});
