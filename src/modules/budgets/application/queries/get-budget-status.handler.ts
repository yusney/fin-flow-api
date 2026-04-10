import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBudgetStatusQuery } from './get-budget-status.query';
import { BUDGET_REPOSITORY } from '../../domain/ports/budget.repository';
import type { IBudgetRepository } from '../../domain/ports/budget.repository';
import { TRANSACTION_REPOSITORY } from '../../../transactions/domain/ports/transaction.repository';
import type { ITransactionRepository } from '../../../transactions/domain/ports/transaction.repository';

export interface BudgetStatusItem {
  categoryId: string;
  limitAmount: number;
  spent: number;
  remaining: number;
}

@QueryHandler(GetBudgetStatusQuery)
export class GetBudgetStatusHandler implements IQueryHandler<GetBudgetStatusQuery> {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(query: GetBudgetStatusQuery): Promise<BudgetStatusItem[]> {
    const budgets = await this.budgetRepository.findByUserAndMonth(
      query.userId,
      query.month,
      query.year,
    );

    if (budgets.length === 0) {
      return [];
    }

    const transactions = await this.transactionRepository.findByUserId(
      query.userId,
      { month: query.month, year: query.year },
    );

    return budgets.map((budget) => {
      const spent = transactions
        .filter((tx) => tx.categoryId === budget.categoryId)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        categoryId: budget.categoryId,
        limitAmount: budget.limitAmount,
        spent,
        remaining: budget.limitAmount - spent,
      };
    });
  }
}
