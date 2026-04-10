jest.mock('@mikro-orm/core', () => ({
  EntityManager: jest.fn(),
  CommandHandler: () => (target: unknown) => target,
}));

jest.mock('@nestjs/cqrs', () => ({
  CommandHandler: () => (target: unknown) => target,
  ICommandHandler: jest.fn(),
}));

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Inject: () => () => {},
}));

import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { UpdateSubscriptionHandler } from './update-subscription.handler';
import { UpdateSubscriptionCommand } from './update-subscription.command';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';
import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../domain/enums/subscription-type.enum';

describe('UpdateSubscriptionHandler', () => {
  let handler: UpdateSubscriptionHandler;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let em: {
    transactional: jest.Mock;
    persist: jest.Mock;
    flush: jest.Mock;
  };

  const makeSubscription = (
    overrides: Partial<{
      id: string;
      userId: string;
      parentId: string | null;
      amount: number;
      description: string;
      billingDay: number;
    }> = {},
  ) =>
    Subscription.create({
      amount: overrides.amount ?? 9.99,
      description: overrides.description ?? 'Netflix',
      billingDay: overrides.billingDay ?? 15,
      categoryId: 'cat-uuid',
      userId: overrides.userId ?? 'user-uuid',
      startDate: new Date('2026-01-01'),
      id: overrides.id ?? 'sub-uuid',
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

    em = {
      transactional: jest
        .fn()
        .mockImplementation((cb: (em: unknown) => Promise<unknown>) => cb(em)),
      persist: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    handler = new UpdateSubscriptionHandler(
      subscriptionRepository,
      em as unknown as EntityManager,
    );
  });

  it('should close current version and create new one with updated amount', async () => {
    const current = makeSubscription({ id: 'sub-uuid', userId: 'user-uuid' });
    subscriptionRepository.findById.mockResolvedValue(current);

    const command = new UpdateSubscriptionCommand(
      'sub-uuid',
      'user-uuid',
      19.99,
    );
    const result = await handler.execute(command);

    expect(current.endDate).toBeInstanceOf(Date);
    expect(current.isActive).toBe(false);
    expect(result.amount).toBe(19.99);
    expect(result.parentId).toBe('sub-uuid');
    expect(em.transactional).toHaveBeenCalledTimes(1);
  });

  it('should set parentId to current.id when current is root (parentId=null)', async () => {
    const current = makeSubscription({
      id: 'root-uuid',
      userId: 'user-uuid',
      parentId: null,
    });
    subscriptionRepository.findById.mockResolvedValue(current);

    const command = new UpdateSubscriptionCommand(
      'root-uuid',
      'user-uuid',
      29.99,
    );
    const result = await handler.execute(command);

    expect(result.parentId).toBe('root-uuid');
  });

  it('should set parentId to current.parentId when current is already versioned', async () => {
    const current = makeSubscription({
      id: 'version-2-uuid',
      userId: 'user-uuid',
      parentId: 'root-uuid',
    });
    subscriptionRepository.findById.mockResolvedValue(current);

    const command = new UpdateSubscriptionCommand(
      'version-2-uuid',
      'user-uuid',
      39.99,
    );
    const result = await handler.execute(command);

    expect(result.parentId).toBe('root-uuid');
  });

  it('should copy unchanged fields from current version', async () => {
    const current = makeSubscription({
      id: 'sub-uuid',
      userId: 'user-uuid',
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
    });
    subscriptionRepository.findById.mockResolvedValue(current);

    const command = new UpdateSubscriptionCommand(
      'sub-uuid',
      'user-uuid',
      19.99,
    );
    const result = await handler.execute(command);

    expect(result.description).toBe('Netflix');
    expect(result.billingDay).toBe(15);
    expect(result.categoryId).toBe('cat-uuid');
    expect(result.userId).toBe('user-uuid');
    expect(result.frequency).toBe(BillingFrequency.MONTHLY);
    expect(result.type).toBe(SubscriptionType.GENERAL);
    expect(result.serviceUrl).toBeNull();
  });

  it('should throw NotFoundException when subscription not found', async () => {
    subscriptionRepository.findById.mockResolvedValue(null);

    const command = new UpdateSubscriptionCommand(
      'nonexistent-uuid',
      'user-uuid',
      19.99,
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(em.transactional).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when subscription belongs to different user', async () => {
    const current = makeSubscription({
      id: 'sub-uuid',
      userId: 'other-user-uuid',
    });
    subscriptionRepository.findById.mockResolvedValue(current);

    const command = new UpdateSubscriptionCommand(
      'sub-uuid',
      'user-uuid',
      19.99,
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(em.transactional).not.toHaveBeenCalled();
  });

  it('should run the close+create operation inside a transaction', async () => {
    const current = makeSubscription({ id: 'sub-uuid', userId: 'user-uuid' });
    subscriptionRepository.findById.mockResolvedValue(current);

    const command = new UpdateSubscriptionCommand(
      'sub-uuid',
      'user-uuid',
      19.99,
    );
    await handler.execute(command);

    expect(em.transactional).toHaveBeenCalledTimes(1);
    expect(em.persist).toHaveBeenCalledTimes(1);
    expect(em.flush).toHaveBeenCalledTimes(1);
  });
});
