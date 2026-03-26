import { CreateTransactionHandler } from './create-transaction.handler';
import { CreateTransactionCommand } from './create-transaction.command';
import { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('CreateTransactionHandler', () => {
  let handler: CreateTransactionHandler;
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
    handler = new CreateTransactionHandler(transactionRepository);
  });

  it('should create a transaction with valid data and return { id }', async () => {
    transactionRepository.save.mockResolvedValue(undefined);

    const command = new CreateTransactionCommand(
      100,
      'Grocery shopping',
      new Date('2026-03-15'),
      'category-uuid',
      'user-uuid',
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.any(Transaction),
    );
  });
});
