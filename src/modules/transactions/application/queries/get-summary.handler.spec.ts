import { GetSummaryHandler } from './get-summary.handler';
import { GetSummaryQuery } from './get-summary.query';
import { ITransactionRepository } from '../../domain/ports/transaction.repository';

describe('GetSummaryHandler', () => {
  let handler: GetSummaryHandler;
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
    handler = new GetSummaryHandler(transactionRepository);
  });

  it('should return summary with totalIncome, totalExpense and balance', async () => {
    const summary = {
      totalIncome: 5000,
      totalExpense: 3200,
      balance: 1800,
    };
    transactionRepository.getSummary.mockResolvedValue(summary);

    const query = new GetSummaryQuery('user-uuid', 3, 2026);
    const result = await handler.execute(query);

    expect(result).toEqual(summary);
    expect(transactionRepository.getSummary).toHaveBeenCalledWith(
      'user-uuid',
      3,
      2026,
    );
  });
});
