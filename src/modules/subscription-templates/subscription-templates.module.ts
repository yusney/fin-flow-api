import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from './domain/ports/subscription-template.repository';
import { MikroOrmSubscriptionTemplateRepository } from './infrastructure/persistence/mikro-orm-subscription-template.repository';
import { GlobalTemplatesSeeder } from './infrastructure/seeders/global-templates.seeder';
import { CreateSubscriptionTemplateHandler } from './application/commands/create-subscription-template.handler';
import { UpdateSubscriptionTemplateHandler } from './application/commands/update-subscription-template.handler';
import { DeleteSubscriptionTemplateHandler } from './application/commands/delete-subscription-template.handler';
import { GetSubscriptionTemplatesHandler } from './application/queries/get-subscription-templates.handler';
import { GetSubscriptionTemplateHandler } from './application/queries/get-subscription-template.handler';
import { SubscriptionTemplatesController } from './presentation/subscription-templates.controller';

const CommandHandlers = [
  CreateSubscriptionTemplateHandler,
  UpdateSubscriptionTemplateHandler,
  DeleteSubscriptionTemplateHandler,
];

const QueryHandlers = [
  GetSubscriptionTemplatesHandler,
  GetSubscriptionTemplateHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [SubscriptionTemplatesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    GlobalTemplatesSeeder,
    {
      provide: SUBSCRIPTION_TEMPLATE_REPOSITORY,
      useClass: MikroOrmSubscriptionTemplateRepository,
    },
  ],
})
export class SubscriptionTemplatesModule {}
