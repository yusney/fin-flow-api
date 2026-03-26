import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository';
import { MikroOrmTransactionRepository } from './infrastructure/persistence/mikro-orm-transaction.repository';
import { CreateTransactionHandler } from './application/commands/create-transaction.handler';
import { UpdateTransactionHandler } from './application/commands/update-transaction.handler';
import { DeleteTransactionHandler } from './application/commands/delete-transaction.handler';
import { GetTransactionsHandler } from './application/queries/get-transactions.handler';
import { GetSummaryHandler } from './application/queries/get-summary.handler';
import { TransactionsController } from './presentation/transactions.controller';

const CommandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  DeleteTransactionHandler,
];

const QueryHandlers = [GetTransactionsHandler, GetSummaryHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TransactionsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: MikroOrmTransactionRepository,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
