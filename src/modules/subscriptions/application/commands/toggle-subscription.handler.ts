import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ToggleSubscriptionCommand } from './toggle-subscription.command';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/ports/subscription.repository';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@CommandHandler(ToggleSubscriptionCommand)
export class ToggleSubscriptionHandler
  implements ICommandHandler<ToggleSubscriptionCommand>
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(
    command: ToggleSubscriptionCommand,
  ): Promise<{ id: string; isActive: boolean }> {
    const subscription = await this.subscriptionRepository.findById(command.id);

    if (!subscription || subscription.userId !== command.userId) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.toggle();
    await this.subscriptionRepository.update(subscription);

    return { id: subscription.id, isActive: subscription.isActive };
  }
}
