import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSummaryQuery } from './get-summary.query';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { ITransactionRepository } from '../../domain/ports/transaction.repository';

@QueryHandler(GetSummaryQuery)
export class GetSummaryHandler implements IQueryHandler<GetSummaryQuery> {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    query: GetSummaryQuery,
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    return this.transactionRepository.getSummary(
      query.userId,
      query.month,
      query.year,
    );
  }
}
