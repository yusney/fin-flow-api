import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSubscriptionCommand } from './create-subscription.command';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/ports/subscription.repository';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler implements ICommandHandler<CreateSubscriptionCommand> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(command: CreateSubscriptionCommand) {
    const subscription = Subscription.create({
      amount: command.amount,
      description: command.description,
      billingDay: command.billingDay,
      categoryId: command.categoryId,
      userId: command.userId,
      startDate: command.startDate,
      endDate: command.endDate,
      frequency: command.frequency,
      type: command.type,
      serviceUrl: command.serviceUrl,
    });

    await this.subscriptionRepository.save(subscription);

    return subscription.toJSON();
  }
}
