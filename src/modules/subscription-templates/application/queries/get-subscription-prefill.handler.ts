import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSubscriptionPrefillQuery } from './get-subscription-prefill.query';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { NotFoundException } from '../../../../shared/domain/exceptions';
import { BillingFrequency } from '../../../subscriptions/domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../../subscriptions/domain/enums/subscription-type.enum';

export interface PrefillData {
  amount: number;
  description: string;
  frequency: BillingFrequency;
  serviceUrl: string | null;
  type: SubscriptionType;
}

@QueryHandler(GetSubscriptionPrefillQuery)
export class GetSubscriptionPrefillHandler implements IQueryHandler<GetSubscriptionPrefillQuery> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(query: GetSubscriptionPrefillQuery): Promise<PrefillData> {
    const template = await this.subscriptionTemplateRepository.findById(
      query.templateId,
    );

    if (!template) {
      throw new NotFoundException('Subscription template not found');
    }

    return {
      amount: template.defaultAmount,
      description: template.name,
      frequency: template.defaultFrequency ?? BillingFrequency.MONTHLY,
      serviceUrl: template.serviceUrl,
      type: template.serviceUrl
        ? SubscriptionType.DIGITAL_SERVICE
        : SubscriptionType.GENERAL,
    };
  }
}
