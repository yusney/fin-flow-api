import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateSubscriptionTemplateCommand } from './update-subscription-template.command';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import {
  ForbiddenException,
  NotFoundException,
} from '../../../../shared/domain/exceptions';

@CommandHandler(UpdateSubscriptionTemplateCommand)
export class UpdateSubscriptionTemplateHandler implements ICommandHandler<UpdateSubscriptionTemplateCommand> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(command: UpdateSubscriptionTemplateCommand) {
    // findByIdForUser returns the template only if it's GLOBAL or owned by the user
    const template = await this.subscriptionTemplateRepository.findByIdForUser(
      command.templateId,
      command.userId,
    );

    if (!template) {
      throw new NotFoundException('Subscription template not found');
    }

    // Global templates cannot be modified by users
    if (template.isGlobal()) {
      throw new ForbiddenException('Global templates cannot be modified');
    }

    template.update({
      name: command.name,
      description: command.description,
      iconUrl: command.iconUrl,
      serviceUrl: command.serviceUrl,
      defaultAmount: command.defaultAmount,
      defaultFrequency: command.defaultFrequency,
      category: command.templateCategory,
    });

    await this.subscriptionTemplateRepository.save(template);

    return template.toJSON();
  }
}
