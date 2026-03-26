import { CreateSubscriptionHandler } from './create-subscription.handler';
import { CreateSubscriptionCommand } from './create-subscription.command';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';
import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../domain/enums/subscription-type.enum';

describe('CreateSubscriptionHandler', () => {
  let handler: CreateSubscriptionHandler;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveDueToday: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    handler = new CreateSubscriptionHandler(subscriptionRepository);
  });

  it('should create a subscription with valid data and return { id }', async () => {
    subscriptionRepository.save.mockResolvedValue(undefined);

    const command = new CreateSubscriptionCommand(
      9.99,
      'Netflix',
      15,
      'category-uuid',
      'user-uuid',
      new Date('2026-01-01'),
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(subscriptionRepository.save).toHaveBeenCalledWith(
      expect.any(Subscription),
    );
  });

  it('should pass all 5 new fields to Subscription.create() and save', async () => {
    subscriptionRepository.save.mockResolvedValue(undefined);

    const startDate = new Date('2026-03-01');
    const endDate = new Date('2027-03-01');
    const command = new CreateSubscriptionCommand(
      14.99,
      'Spotify',
      1,
      'category-uuid',
      'user-uuid',
      startDate,
      endDate,
      BillingFrequency.ANNUAL,
      SubscriptionType.DIGITAL_SERVICE,
      'https://spotify.com',
    );

    await handler.execute(command);

    const savedSubscription = subscriptionRepository.save.mock.calls[0][0];
    expect(savedSubscription.startDate).toEqual(startDate);
    expect(savedSubscription.endDate).toEqual(endDate);
    expect(savedSubscription.frequency).toBe(BillingFrequency.ANNUAL);
    expect(savedSubscription.type).toBe(SubscriptionType.DIGITAL_SERVICE);
    expect(savedSubscription.serviceUrl).toBe('https://spotify.com');
  });

  it('should still return { id } with new fields', async () => {
    subscriptionRepository.save.mockResolvedValue(undefined);

    const command = new CreateSubscriptionCommand(
      9.99,
      'Netflix',
      15,
      'category-uuid',
      'user-uuid',
      new Date('2026-01-01'),
    );
    const result = await handler.execute(command);

    expect(result).toEqual({ id: expect.any(String) });
  });
});
