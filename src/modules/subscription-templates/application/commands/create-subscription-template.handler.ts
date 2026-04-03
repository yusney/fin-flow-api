import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSubscriptionTemplateCommand } from './create-subscription-template.command';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';
import { TemplateOwnership } from '../../domain/enums/template-ownership.enum';

@CommandHandler(CreateSubscriptionTemplateCommand)
export class CreateSubscriptionTemplateHandler implements ICommandHandler<CreateSubscriptionTemplateCommand> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(command: CreateSubscriptionTemplateCommand) {
    const template = SubscriptionTemplate.create({
      name: command.name,
      description: command.description,
      iconUrl: command.iconUrl,
      serviceUrl: command.serviceUrl,
      defaultAmount: command.defaultAmount,
      defaultFrequency: command.defaultFrequency,
      category: command.category,
      ownership: TemplateOwnership.USER,
      userId: command.userId,
    });

    await this.subscriptionTemplateRepository.save(template);

    return template.toJSON();
  }
}
