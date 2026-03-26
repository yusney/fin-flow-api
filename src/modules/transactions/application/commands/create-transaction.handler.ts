import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTransactionCommand } from './create-transaction.command';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<{ id: string }> {
    const transaction = Transaction.create({
      amount: command.amount,
      description: command.description,
      date: command.date,
      categoryId: command.categoryId,
      userId: command.userId,
    });

    await this.transactionRepository.save(transaction);

    return { id: transaction.id };
  }
}
