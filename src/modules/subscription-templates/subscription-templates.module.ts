import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from './domain/ports/subscription-template.repository';
import { MikroOrmSubscriptionTemplateRepository } from './infrastructure/persistence/mikro-orm-subscription-template.repository';
import { GlobalTemplatesSeeder } from './infrastructure/seeders/global-templates.seeder';
import { GetSubscriptionTemplatesHandler } from './application/queries/get-subscription-templates.handler';
import { GetSubscriptionTemplateHandler } from './application/queries/get-subscription-template.handler';
import { GetSubscriptionPrefillHandler } from './application/queries/get-subscription-prefill.handler';
import { SubscriptionTemplatesController } from './presentation/subscription-templates.controller';

const QueryHandlers = [
  GetSubscriptionTemplatesHandler,
  GetSubscriptionTemplateHandler,
  GetSubscriptionPrefillHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [SubscriptionTemplatesController],
  providers: [
    ...QueryHandlers,
    GlobalTemplatesSeeder,
    {
      provide: SUBSCRIPTION_TEMPLATE_REPOSITORY,
      useClass: MikroOrmSubscriptionTemplateRepository,
    },
  ],
})
export class SubscriptionTemplatesModule {}
