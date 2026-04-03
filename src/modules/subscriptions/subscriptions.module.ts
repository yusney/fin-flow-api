import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SUBSCRIPTION_REPOSITORY } from './domain/ports/subscription.repository';
import { MikroOrmSubscriptionRepository } from './infrastructure/persistence/mikro-orm-subscription.repository';
import { CreateSubscriptionHandler } from './application/commands/create-subscription.handler';
import { ToggleSubscriptionHandler } from './application/commands/toggle-subscription.handler';
import { UpdateSubscriptionHandler } from './application/commands/update-subscription.handler';
import { GetSubscriptionsHandler } from './application/queries/get-subscriptions.handler';
import { GetSubscriptionHistoryHandler } from './application/queries/get-subscription-history.handler';
import { SubscriptionBillingService } from './application/services/subscription-billing.service';
import { SubscriptionsController } from './presentation/subscriptions.controller';

const CommandHandlers = [
  CreateSubscriptionHandler,
  ToggleSubscriptionHandler,
  UpdateSubscriptionHandler,
];

const QueryHandlers = [GetSubscriptionsHandler, GetSubscriptionHistoryHandler];

@Module({
  imports: [CqrsModule],
  controllers: [SubscriptionsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    SubscriptionBillingService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MikroOrmSubscriptionRepository,
    },
  ],
})
export class SubscriptionsModule {}
