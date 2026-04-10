import { GetBudgetStatusHandler } from './get-budget-status.handler';
import { GetBudgetStatusQuery } from './get-budget-status.query';
import { IBudgetRepository } from '../../domain/ports/budget.repository';
import { ITransactionRepository } from '../../../transactions/domain/ports/transaction.repository';
import { Budget } from '../../domain/entities/budget.entity';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';

describe('GetBudgetStatusHandler', () => {
  let handler: GetBudgetStatusHandler;
  let budgetRepository: jest.Mocked<IBudgetRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    budgetRepository = {
      findById: jest.fn(),
      findByUserAndMonth: jest.fn(),
      findByUserCategoryAndMonth: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    transactionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getSummary: jest.fn(),
    };
    handler = new GetBudgetStatusHandler(
      budgetRepository,
      transactionRepository,
    );
  });

  it('should return budget status array with spent and remaining amounts', async () => {
    const budget1 = Budget.create({
      limitAmount: 5000,
      month: 3,
      year: 2026,
      categoryId: 'cat-food',
      userId: 'user-uuid',
    });
    const budget2 = Budget.create({
      limitAmount: 2000,
      month: 3,
      year: 2026,
      categoryId: 'cat-transport',
      userId: 'user-uuid',
    });

    budgetRepository.findByUserAndMonth.mockResolvedValue([budget1, budget2]);

    // Transactions for category "food" in March 2026
    const tx1 = Transaction.create({
      amount: 1500,
      description: 'Groceries',
      date: new Date('2026-03-10'),
      categoryId: 'cat-food',
      userId: 'user-uuid',
    });
    const tx2 = Transaction.create({
      amount: 800,
      description: 'Restaurant',
      date: new Date('2026-03-15'),
      categoryId: 'cat-food',
      userId: 'user-uuid',
    });
    // Transaction for category "transport"
    const tx3 = Transaction.create({
      amount: 500,
      description: 'Uber',
      date: new Date('2026-03-12'),
      categoryId: 'cat-transport',
      userId: 'user-uuid',
    });

    transactionRepository.findByUserId.mockResolvedValue([tx1, tx2, tx3]);

    const query = new GetBudgetStatusQuery('user-uuid', 3, 2026);
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: 'cat-food',
          limitAmount: 5000,
          spent: 2300,
          remaining: 2700,
        }),
        expect.objectContaining({
          categoryId: 'cat-transport',
          limitAmount: 2000,
          spent: 500,
          remaining: 1500,
        }),
      ]),
    );
  });

  it('should return empty array when user has no budgets for the month', async () => {
    budgetRepository.findByUserAndMonth.mockResolvedValue([]);

    const query = new GetBudgetStatusQuery('user-uuid', 3, 2026);
    const result = await handler.execute(query);

    expect(result).toEqual([]);
  });
});
