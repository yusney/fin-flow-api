import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteSubscriptionTemplateCommand } from './delete-subscription-template.command';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import {
  ForbiddenException,
  NotFoundException,
} from '../../../../shared/domain/exceptions';

@CommandHandler(DeleteSubscriptionTemplateCommand)
export class DeleteSubscriptionTemplateHandler implements ICommandHandler<DeleteSubscriptionTemplateCommand> {
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(command: DeleteSubscriptionTemplateCommand): Promise<void> {
    // findByIdForUser returns the template only if it's GLOBAL or owned by the user
    const template = await this.subscriptionTemplateRepository.findByIdForUser(
      command.templateId,
      command.userId,
    );

    if (!template) {
      throw new NotFoundException('Subscription template not found');
    }

    // Global templates cannot be deleted by users
    if (template.isGlobal()) {
      throw new ForbiddenException('Global templates cannot be deleted');
    }

    await this.subscriptionTemplateRepository.delete(template);
  }
}
