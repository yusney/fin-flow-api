import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteSubscriptionTemplateCommand } from './delete-subscription-template.command';
import { SUBSCRIPTION_TEMPLATE_REPOSITORY } from '../../domain/ports/subscription-template.repository';
import type { ISubscriptionTemplateRepository } from '../../domain/ports/subscription-template.repository';
import { ForbiddenException } from '../../../../shared/domain/exceptions';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@CommandHandler(DeleteSubscriptionTemplateCommand)
export class DeleteSubscriptionTemplateHandler
  implements ICommandHandler<DeleteSubscriptionTemplateCommand>
{
  constructor(
    @Inject(SUBSCRIPTION_TEMPLATE_REPOSITORY)
    private readonly subscriptionTemplateRepository: ISubscriptionTemplateRepository,
  ) {}

  async execute(command: DeleteSubscriptionTemplateCommand): Promise<void> {
    const template = await this.subscriptionTemplateRepository.findById(
      command.id,
    );

    if (!template) {
      throw new NotFoundException('Subscription template not found');
    }

    if (template.isGlobal()) {
      throw new ForbiddenException('Cannot delete global templates');
    }

    if (!template.isOwnedBy(command.userId)) {
      throw new NotFoundException('Subscription template not found');
    }

    await this.subscriptionTemplateRepository.delete(template);
  }
}
