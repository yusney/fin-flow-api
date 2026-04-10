import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSubscriptionTemplatesQuery } from './get-subscription-templates.query';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';

@QueryHandler(GetSubscriptionTemplatesQuery)
export class GetSubscriptionTemplatesHandler implements IQueryHandler<GetSubscriptionTemplatesQuery> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(
    query: GetSubscriptionTemplatesQuery,
  ): Promise<SubscriptionTemplate[]> {
    return this.subscriptionTemplateRepository.findAllForUser(
      query.userId,
      query.category,
    );
  }
}
