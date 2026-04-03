import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { UpdateSubscriptionCommand } from './update-subscription.command';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/ports/subscription.repository';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { Subscription } from '../../domain/entities/subscription.entity';

@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler implements ICommandHandler<UpdateSubscriptionCommand> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(command: UpdateSubscriptionCommand) {
    const current = await this.subscriptionRepository.findById(command.id);

    if (!current || current.userId !== command.userId) {
      throw new NotFoundException(
        `Subscription with id "${command.id}" not found`,
      );
    }

    let newSubscription: Subscription;

    await this.em.transactional(async (em) => {
      const closedAt = new Date();
      current.closeVersion(closedAt);

      newSubscription = Subscription.create({
        amount: command.amount ?? current.amount,
        description: command.description ?? current.description,
        billingDay: command.billingDay ?? current.billingDay,
        categoryId: current.categoryId,
        userId: current.userId,
        startDate: new Date(),
        endDate: null,
        frequency: command.frequency ?? current.frequency,
        type: command.type ?? current.type,
        serviceUrl:
          command.serviceUrl !== undefined
            ? command.serviceUrl
            : current.serviceUrl,
        parentId: current.parentId ?? current.id,
      });

      em.persist(newSubscription);
      await em.flush();
    });

    return newSubscription!.toJSON();
  }
}
