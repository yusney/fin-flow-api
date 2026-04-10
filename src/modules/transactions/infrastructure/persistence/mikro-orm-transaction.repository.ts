import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

@Injectable()
export class MikroOrmTransactionRepository implements ITransactionRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Transaction | null> {
    return this.em.findOne(Transaction, { id });
  }

  async findByUserId(
    userId: string,
    filters?: { month?: number; year?: number },
  ): Promise<Transaction[]> {
    const where: Record<string, any> = { userId };

    if (filters?.month && filters?.year) {
      const startDate = new Date(filters.year, filters.month - 1, 1);
      const endDate = new Date(filters.year, filters.month, 1);
      where.date = { $gte: startDate, $lt: endDate };
    }

    return this.em.find(Transaction, where, { orderBy: { date: 'DESC' } });
  }

  async save(transaction: Transaction): Promise<void> {
    this.em.persist(transaction);
    await this.em.flush();
  }

  async update(_transaction: Transaction): Promise<void> {
    await this.em.flush();
  }

  async delete(transaction: Transaction): Promise<void> {
    this.em.remove(transaction);
    await this.em.flush();
  }

  async getSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const connection = this.em.getConnection();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawResult = await connection.execute(
      `SELECT
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.date >= ? AND t.date < ?`,
      [userId, startDate, endDate],
    );
    const result = rawResult as {
      total_income: string;
      total_expense: string;
    }[];

    const row = result[0];
    const totalIncome = Number(row?.total_income ?? 0);
    const totalExpense = Number(row?.total_expense ?? 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
