import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTransactionsQuery } from './get-transactions.query';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { ITransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(query: GetTransactionsQuery): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(query.userId, {
      month: query.month,
      year: query.year,
    });
  }
}
