import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateSubscriptionTemplateCommand } from './update-subscription-template.command';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { ForbiddenException } from '../../../../shared/domain/exceptions';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@CommandHandler(UpdateSubscriptionTemplateCommand)
export class UpdateSubscriptionTemplateHandler implements ICommandHandler<UpdateSubscriptionTemplateCommand> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(command: UpdateSubscriptionTemplateCommand) {
    const template = await this.subscriptionTemplateRepository.findById(
      command.id,
    );

    if (!template) {
      throw new NotFoundException('Subscription template not found');
    }

    if (template.isGlobal()) {
      throw new ForbiddenException('Cannot modify global templates');
    }

    if (!template.isOwnedBy(command.userId)) {
      throw new NotFoundException('Subscription template not found');
    }

    template.update({
      name: command.name,
      description: command.description,
      iconUrl: command.iconUrl,
      serviceUrl: command.serviceUrl,
      defaultAmount: command.defaultAmount ?? undefined,
      defaultFrequency: command.defaultFrequency,
      category: command.category,
    });

    await this.subscriptionTemplateRepository.update(template);

    return template.toJSON();
  }
}
