import { GetTransactionsHandler } from './get-transactions.handler';
import { GetTransactionsQuery } from './get-transactions.query';
import { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('GetTransactionsHandler', () => {
  let handler: GetTransactionsHandler;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    transactionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getSummary: jest.fn(),
    };
    handler = new GetTransactionsHandler(transactionRepository);
  });

  it('should return transactions for the given userId', async () => {
    const transactions = [
      Transaction.create({
        amount: 100,
        description: 'Salary',
        date: new Date('2026-03-01'),
        categoryId: 'cat-1',
        userId: 'user-uuid',
      }),
      Transaction.create({
        amount: 50,
        description: 'Coffee',
        date: new Date('2026-03-02'),
        categoryId: 'cat-2',
        userId: 'user-uuid',
      }),
    ];
    transactionRepository.findByUserId.mockResolvedValue(transactions);

    const query = new GetTransactionsQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(transactions);
    expect(transactionRepository.findByUserId).toHaveBeenCalledWith(
      'user-uuid',
      { month: undefined, year: undefined },
    );
  });

  it('should pass month and year filters to repository', async () => {
    transactionRepository.findByUserId.mockResolvedValue([]);

    const query = new GetTransactionsQuery('user-uuid', 3, 2026);
    await handler.execute(query);

    expect(transactionRepository.findByUserId).toHaveBeenCalledWith(
      'user-uuid',
      { month: 3, year: 2026 },
    );
  });

  it('should return empty array when user has no transactions', async () => {
    transactionRepository.findByUserId.mockResolvedValue([]);

    const query = new GetTransactionsQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toEqual([]);
  });
});
