import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetSubscriptionHistoryQuery } from './get-subscription-history.query';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/ports/subscription.repository';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';

@QueryHandler(GetSubscriptionHistoryQuery)
export class GetSubscriptionHistoryHandler implements IQueryHandler<GetSubscriptionHistoryQuery> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(query: GetSubscriptionHistoryQuery) {
    const sub = await this.subscriptionRepository.findById(
      query.subscriptionId,
    );

    if (!sub || sub.userId !== query.userId) {
      throw new NotFoundException(
        `Subscription with id "${query.subscriptionId}" not found`,
      );
    }

    const rootId = sub.parentId ?? sub.id;
    const history =
      await this.subscriptionRepository.findHistoryByRootId(rootId);

    return history.map((s) => s.toJSON());
  }
}
