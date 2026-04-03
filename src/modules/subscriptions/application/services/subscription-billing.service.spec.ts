import { CommandBus } from '@nestjs/cqrs';
import { SubscriptionBillingService } from './subscription-billing.service';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';
import { CreateTransactionCommand } from '../../../transactions/application/commands/create-transaction.command';
import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';

describe('SubscriptionBillingService', () => {
  let service: SubscriptionBillingService;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveDueToday: jest.fn(),
      findHistoryByRootId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    commandBus = {
      execute: jest.fn(),
    } as any;
    service = new SubscriptionBillingService(
      subscriptionRepository,
      commandBus,
    );
  });

  it('should call findActiveDueToday with day and isLastDayOfMonth flag', async () => {
    subscriptionRepository.findActiveDueToday.mockResolvedValue([]);

    await service.handleBilling();

    const today = new Date().getDate();
    const lastDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();
    const isLastDay = today === lastDay;
    expect(subscriptionRepository.findActiveDueToday).toHaveBeenCalledWith(
      today,
      isLastDay,
    );
  });

  it('should call CommandBus.execute for each active subscription due today', async () => {
    const sub1 = Subscription.create({
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    const sub2 = Subscription.create({
      amount: 14.99,
      description: 'Spotify',
      billingDay: 15,
      categoryId: 'cat-2',
      userId: 'user-2',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub1, sub2]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(commandBus.execute).toHaveBeenCalledTimes(2);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 9.99,
        description: '[Auto] Netflix',
        categoryId: 'cat-1',
        userId: 'user-1',
      }),
    );
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 14.99,
        description: '[Auto] Spotify',
        categoryId: 'cat-2',
        userId: 'user-2',
      }),
    );
  });

  it('should only process active subscriptions (inactive skipped by repo query)', async () => {
    const activeSub = Subscription.create({
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([activeSub]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });

  it('should not call CommandBus when no subscriptions are due', async () => {
    subscriptionRepository.findActiveDueToday.mockResolvedValue([]);

    await service.handleBilling();

    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('should not block other subscriptions when one fails', async () => {
    const sub1 = Subscription.create({
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    const sub2 = Subscription.create({
      amount: 14.99,
      description: 'Spotify',
      billingDay: 15,
      categoryId: 'cat-2',
      userId: 'user-2',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub1, sub2]);
    commandBus.execute
      .mockRejectedValueOnce(new Error('Payment failed'))
      .mockResolvedValueOnce({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(commandBus.execute).toHaveBeenCalledTimes(2);
  });

  // T8: Monthly subscription on correct day → billed
  it('T8: should bill a monthly subscription on the correct billing day', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026

    const sub = Subscription.create({
      amount: 9.99,
      description: 'Netflix',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 9.99,
        description: '[Auto] Netflix',
        userId: 'user-1',
      }),
    );

    jest.useRealTimers();
  });

  // T9: Annual subscription on correct month+day → billed
  it('T9: should bill an annual subscription on the correct month and day', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026

    const sub = Subscription.create({
      amount: 99.99,
      description: 'Annual Service',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 2, 15), // Started March 15, 2025
      frequency: BillingFrequency.ANNUAL,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 99.99,
        description: '[Auto] Annual Service',
      }),
    );

    jest.useRealTimers();
  });

  // T10: Annual subscription on wrong month → NOT billed
  it('T10: should NOT bill an annual subscription on the wrong month', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026

    const sub = Subscription.create({
      amount: 99.99,
      description: 'Annual Service',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 5, 15), // Started June 15, 2025 — wrong month
      frequency: BillingFrequency.ANNUAL,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);

    await service.handleBilling();

    expect(commandBus.execute).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  // T11: billingDay=31 in February (non-leap) → clamped to 28, billed
  it('T11: should bill when billingDay=31 is clamped to 28 in February (non-leap year)', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 28)); // Feb 28, 2026 (non-leap, last day)

    const sub = Subscription.create({
      amount: 9.99,
      description: 'Monthly Sub',
      billingDay: 31,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(subscriptionRepository.findActiveDueToday).toHaveBeenCalledWith(
      28,
      true,
    );
    expect(commandBus.execute).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  // T12: billingDay=31 in April → clamped to 30, billed
  it('T12: should bill when billingDay=31 is clamped to 30 in April', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 3, 30)); // April 30, 2026 (last day)

    const sub = Subscription.create({
      amount: 9.99,
      description: 'Monthly Sub',
      billingDay: 31,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(subscriptionRepository.findActiveDueToday).toHaveBeenCalledWith(
      30,
      true,
    );
    expect(commandBus.execute).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  // T13: Subscription with future startDate → NOT billed
  it('T13: should NOT bill a subscription with a future startDate', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026

    const sub = Subscription.create({
      amount: 9.99,
      description: 'Future Sub',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2026, 5, 1), // June 1, 2026 — future
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);

    await service.handleBilling();

    expect(commandBus.execute).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  // T14: Subscription with expired endDate → NOT billed
  it('T14: should NOT bill a subscription with an expired endDate', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026

    const sub = Subscription.create({
      amount: 9.99,
      description: 'Expired Sub',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2026, 1, 28), // Feb 28, 2026 — expired
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);

    await service.handleBilling();

    expect(commandBus.execute).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  // T15: Subscription within date range → billed
  it('T15: should bill a subscription within its valid date range', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026

    const sub = Subscription.create({
      amount: 9.99,
      description: 'Active Range Sub',
      billingDay: 15,
      categoryId: 'cat-1',
      userId: 'user-1',
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2027, 0, 1), // Jan 1, 2027 — still valid
      frequency: BillingFrequency.MONTHLY,
    });
    subscriptionRepository.findActiveDueToday.mockResolvedValue([sub]);
    commandBus.execute.mockResolvedValue({ id: 'tx-uuid' });

    await service.handleBilling();

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 9.99,
        description: '[Auto] Active Range Sub',
      }),
    );

    jest.useRealTimers();
  });
});
