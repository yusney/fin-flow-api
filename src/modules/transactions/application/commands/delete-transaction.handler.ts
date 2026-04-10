import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteTransactionCommand } from './delete-transaction.command';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(command: DeleteTransactionCommand): Promise<void> {
    const transaction = await this.transactionRepository.findById(command.id);

    if (!transaction || transaction.userId !== command.userId) {
      throw new NotFoundException('Transaction not found');
    }

    await this.transactionRepository.delete(transaction);
  }
}
