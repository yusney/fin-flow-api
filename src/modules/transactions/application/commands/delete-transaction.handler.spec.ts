import { DeleteTransactionHandler } from './delete-transaction.handler';
import { DeleteTransactionCommand } from './delete-transaction.command';
import { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('DeleteTransactionHandler', () => {
  let handler: DeleteTransactionHandler;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  const existingTransaction = Transaction.create({
    amount: 100,
    description: 'To delete',
    date: new Date('2026-03-01'),
    categoryId: 'cat-uuid',
    userId: 'user-uuid',
    id: 'tx-uuid',
  });

  beforeEach(() => {
    transactionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getSummary: jest.fn(),
    };
    handler = new DeleteTransactionHandler(transactionRepository);
  });

  it('should delete transaction when it belongs to the user', async () => {
    transactionRepository.findById.mockResolvedValue(existingTransaction);
    transactionRepository.delete.mockResolvedValue(undefined);

    const command = new DeleteTransactionCommand('tx-uuid', 'user-uuid');
    await handler.execute(command);

    expect(transactionRepository.delete).toHaveBeenCalledWith(
      existingTransaction,
    );
  });

  it('should throw NotFoundException when transaction is not found', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    const command = new DeleteTransactionCommand('non-existent', 'user-uuid');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when transaction belongs to another user', async () => {
    transactionRepository.findById.mockResolvedValue(existingTransaction);

    const command = new DeleteTransactionCommand('tx-uuid', 'different-user');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
