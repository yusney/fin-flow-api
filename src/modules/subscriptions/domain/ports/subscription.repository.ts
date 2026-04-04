import { Subscription } from '../entities/subscription.entity';

export const SUBSCRIPTION_REPOSITORY = 'SUBSCRIPTION_REPOSITORY';

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription[]>;
  findActiveDueToday(
    day: number,
    isLastDayOfMonth: boolean,
  ): Promise<Subscription[]>;
  findHistoryByRootId(rootId: string): Promise<Subscription[]>;
  save(subscription: Subscription): Promise<void>;
  update(subscription: Subscription): Promise<void>;
}
