import { Transaction } from '../entities/transaction.entity';

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(
    userId: string,
    filters?: { month?: number; year?: number },
  ): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(transaction: Transaction): Promise<void>;
  getSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }>;
}
