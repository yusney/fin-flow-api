import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateTransactionCommand } from './update-transaction.command';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(command: UpdateTransactionCommand) {
    const transaction = await this.transactionRepository.findById(command.id);

    if (!transaction || transaction.userId !== command.userId) {
      throw new NotFoundException('Transaction not found');
    }

    if (command.amount !== undefined) {
      transaction.amount = command.amount;
    }
    if (command.description !== undefined) {
      transaction.description = command.description;
    }
    if (command.date !== undefined) {
      transaction.date = command.date;
    }
    if (command.categoryId !== undefined) {
      transaction.categoryId = command.categoryId;
    }

    transaction.updatedAt = new Date();

    await this.transactionRepository.update(transaction);

    return transaction.toJSON();
  }
}
