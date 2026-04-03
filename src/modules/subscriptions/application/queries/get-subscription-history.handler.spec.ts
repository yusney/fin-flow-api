jest.mock('@nestjs/cqrs', () => ({
  QueryHandler: () => (target: unknown) => target,
  IQueryHandler: jest.fn(),
}));

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Inject: () => () => {},
}));

import { NotFoundException } from '@nestjs/common';
import { GetSubscriptionHistoryHandler } from './get-subscription-history.handler';
import { GetSubscriptionHistoryQuery } from './get-subscription-history.query';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

describe('GetSubscriptionHistoryHandler', () => {
  let handler: GetSubscriptionHistoryHandler;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const makeSubscription = (overrides: {
    id: string;
    userId?: string;
    parentId?: string | null;
    startDate?: Date;
    amount?: number;
  }) =>
    Subscription.create({
      amount: overrides.amount ?? 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'cat-uuid',
      userId: overrides.userId ?? 'user-uuid',
      startDate: overrides.startDate ?? new Date('2026-01-01'),
      id: overrides.id,
      parentId: overrides.parentId !== undefined ? overrides.parentId : null,
    });

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveDueToday: jest.fn(),
      findHistoryByRootId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as jest.Mocked<ISubscriptionRepository>;

    handler = new GetSubscriptionHistoryHandler(subscriptionRepository);
  });

  it('should return history when querying root subscription', async () => {
    const root = makeSubscription({
      id: 'root-uuid',
      userId: 'user-uuid',
      parentId: null,
    });
    const v2 = makeSubscription({
      id: 'v2-uuid',
      userId: 'user-uuid',
      parentId: 'root-uuid',
      startDate: new Date('2026-02-01'),
    });

    subscriptionRepository.findById.mockResolvedValue(root);
    subscriptionRepository.findHistoryByRootId.mockResolvedValue([root, v2]);

    const query = new GetSubscriptionHistoryQuery('root-uuid', 'user-uuid');
    const result = await handler.execute(query);

    expect(subscriptionRepository.findHistoryByRootId).toHaveBeenCalledWith(
      'root-uuid',
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('root-uuid');
    expect(result[1].id).toBe('v2-uuid');
  });

  it('should return history when querying non-root version (resolves to root)', async () => {
    const v2 = makeSubscription({
      id: 'v2-uuid',
      userId: 'user-uuid',
      parentId: 'root-uuid',
    });
    const root = makeSubscription({
      id: 'root-uuid',
      userId: 'user-uuid',
      parentId: null,
    });
    const v3 = makeSubscription({
      id: 'v3-uuid',
      userId: 'user-uuid',
      parentId: 'root-uuid',
      startDate: new Date('2026-03-01'),
    });

    subscriptionRepository.findById.mockResolvedValue(v2);
    subscriptionRepository.findHistoryByRootId.mockResolvedValue([
      root,
      v2,
      v3,
    ]);

    const query = new GetSubscriptionHistoryQuery('v2-uuid', 'user-uuid');
    const result = await handler.execute(query);

    expect(subscriptionRepository.findHistoryByRootId).toHaveBeenCalledWith(
      'root-uuid',
    );
    expect(result).toHaveLength(3);
  });

  it('should throw NotFoundException when subscription not found', async () => {
    subscriptionRepository.findById.mockResolvedValue(null);

    const query = new GetSubscriptionHistoryQuery(
      'nonexistent-uuid',
      'user-uuid',
    );

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(subscriptionRepository.findHistoryByRootId).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when subscription belongs to different user', async () => {
    const sub = makeSubscription({ id: 'sub-uuid', userId: 'other-user-uuid' });
    subscriptionRepository.findById.mockResolvedValue(sub);

    const query = new GetSubscriptionHistoryQuery('sub-uuid', 'user-uuid');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(subscriptionRepository.findHistoryByRootId).not.toHaveBeenCalled();
  });

  it('should return versions ordered by startDate ASC (as returned by repo)', async () => {
    const root = makeSubscription({
      id: 'root-uuid',
      userId: 'user-uuid',
      startDate: new Date('2026-01-01'),
    });
    const v2 = makeSubscription({
      id: 'v2-uuid',
      userId: 'user-uuid',
      parentId: 'root-uuid',
      startDate: new Date('2026-02-01'),
    });
    const v3 = makeSubscription({
      id: 'v3-uuid',
      userId: 'user-uuid',
      parentId: 'root-uuid',
      startDate: new Date('2026-03-01'),
    });

    subscriptionRepository.findById.mockResolvedValue(root);
    subscriptionRepository.findHistoryByRootId.mockResolvedValue([
      root,
      v2,
      v3,
    ]);

    const query = new GetSubscriptionHistoryQuery('root-uuid', 'user-uuid');
    const result = await handler.execute(query);

    expect(result[0].startDate).toEqual(new Date('2026-01-01'));
    expect(result[1].startDate).toEqual(new Date('2026-02-01'));
    expect(result[2].startDate).toEqual(new Date('2026-03-01'));
  });
});
