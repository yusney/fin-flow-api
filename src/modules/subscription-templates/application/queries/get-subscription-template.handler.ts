import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSubscriptionTemplateQuery } from './get-subscription-template.query';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@QueryHandler(GetSubscriptionTemplateQuery)
export class GetSubscriptionTemplateHandler implements IQueryHandler<GetSubscriptionTemplateQuery> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(
    query: GetSubscriptionTemplateQuery,
  ): Promise<SubscriptionTemplate> {
    const template = await this.subscriptionTemplateRepository.findById(
      query.templateId,
    );

    if (!template) {
      throw new NotFoundException('Subscription template not found');
    }

    return template;
  }
}
