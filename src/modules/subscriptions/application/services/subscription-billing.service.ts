import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/ports/subscription.repository';
import type { ISubscriptionRepository } from '../../domain/ports/subscription.repository';
import { CreateTransactionCommand } from '../../../transactions/application/commands/create-transaction.command';
import { BillingFrequency } from '../../domain/enums/billing-frequency.enum';

@Injectable()
export class SubscriptionBillingService {
  private readonly logger = new Logger(SubscriptionBillingService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleBilling(): Promise<void> {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth(); // 0-based for comparison with Date.getMonth()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const isLastDayOfMonth = day === lastDayOfMonth;
    const subscriptions = await this.subscriptionRepo.findActiveDueToday(day, isLastDayOfMonth);

    for (const sub of subscriptions) {
      try {
        // Skip annual subscriptions if current month doesn't match start month
        if (sub.frequency === BillingFrequency.ANNUAL && sub.startDate.getMonth() !== month) {
          continue;
        }

        // Skip if subscription hasn't started yet
        if (now < sub.startDate) {
          continue;
        }

        // Skip if subscription has expired
        if (sub.endDate !== null && now > sub.endDate) {
          continue;
        }

        await this.commandBus.execute(
          new CreateTransactionCommand(
            sub.amount,
            `[Auto] ${sub.description}`,
            new Date(),
            sub.categoryId,
            sub.userId,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to bill subscription ${sub.id}: ${error.message}`,
        );
      }
    }
  }
}
