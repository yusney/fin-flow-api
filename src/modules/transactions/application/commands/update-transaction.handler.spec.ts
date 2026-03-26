import { UpdateTransactionHandler } from './update-transaction.handler';
import { UpdateTransactionCommand } from './update-transaction.command';
import { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('UpdateTransactionHandler', () => {
  let handler: UpdateTransactionHandler;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  const existingTransaction = Transaction.create({
    amount: 100,
    description: 'Original',
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
    handler = new UpdateTransactionHandler(transactionRepository);
  });

  it('should update transaction when it belongs to the user', async () => {
    transactionRepository.findById.mockResolvedValue(existingTransaction);
    transactionRepository.update.mockResolvedValue(undefined);

    const command = new UpdateTransactionCommand(
      'tx-uuid',
      200,
      'Updated description',
      undefined,
      undefined,
      'user-uuid',
    );
    await handler.execute(command);

    expect(transactionRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 200,
        description: 'Updated description',
      }),
    );
  });

  it('should throw NotFoundException when transaction is not found', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    const command = new UpdateTransactionCommand(
      'non-existent',
      200,
      undefined,
      undefined,
      undefined,
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when transaction belongs to another user', async () => {
    transactionRepository.findById.mockResolvedValue(existingTransaction);

    const command = new UpdateTransactionCommand(
      'tx-uuid',
      200,
      undefined,
      undefined,
      undefined,
      'different-user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
