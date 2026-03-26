import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

@Injectable()
export class MikroOrmSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Subscription | null> {
    return this.em.findOne(Subscription, { id });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.em.find(Subscription, { userId }, { orderBy: { createdAt: 'DESC' } });
  }

  async findActiveDueToday(day: number, isLastDayOfMonth: boolean): Promise<Subscription[]> {
    const filter: any = { isActive: true };
    if (isLastDayOfMonth) {
      filter.billingDay = { $gte: day };
    } else {
      filter.billingDay = day;
    }
    return this.em.find(Subscription, filter);
  }

  async save(subscription: Subscription): Promise<void> {
    this.em.persist(subscription);
    await this.em.flush();
  }

  async update(subscription: Subscription): Promise<void> {
    await this.em.flush();
  }
}
