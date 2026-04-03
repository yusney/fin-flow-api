import { Injectable } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

@Injectable()
export class MikroOrmSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Subscription | null> {
    return this.em.findOne(Subscription, { id });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.em.find(
      Subscription,
      { userId, endDate: null },
      { orderBy: { createdAt: 'DESC' } },
    );
  }

  async findActiveDueToday(
    day: number,
    isLastDayOfMonth: boolean,
  ): Promise<Subscription[]> {
    const filter: FilterQuery<Subscription> = isLastDayOfMonth
      ? { isActive: true, billingDay: { $gte: day } }
      : { isActive: true, billingDay: day };
    return this.em.find(Subscription, filter);
  }

  async findHistoryByRootId(rootId: string): Promise<Subscription[]> {
    return this.em.find(
      Subscription,
      { $or: [{ id: rootId }, { parentId: rootId }] },
      { orderBy: { startDate: 'ASC' } },
    );
  }

  async save(subscription: Subscription): Promise<void> {
    this.em.persist(subscription);
    await this.em.flush();
  }

  async update(subscription: Subscription): Promise<void> {
    await this.em.flush();
  }
}
