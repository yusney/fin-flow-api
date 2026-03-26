import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSubscriptionsQuery } from './get-subscriptions.query';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/ports/subscription.repository';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

@QueryHandler(GetSubscriptionsQuery)
export class GetSubscriptionsHandler
  implements IQueryHandler<GetSubscriptionsQuery>
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(query: GetSubscriptionsQuery): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(query.userId);
  }
}
