import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BUDGET_REPOSITORY } from './domain/ports/budget.repository';
import { MikroOrmBudgetRepository } from './infrastructure/persistence/mikro-orm-budget.repository';
import { CreateBudgetHandler } from './application/commands/create-budget.handler';
import { GetBudgetStatusHandler } from './application/queries/get-budget-status.handler';
import { BudgetsController } from './presentation/budgets.controller';

const CommandHandlers = [CreateBudgetHandler];
const QueryHandlers = [GetBudgetStatusHandler];

@Module({
  imports: [CqrsModule, CategoriesModule, TransactionsModule],
  controllers: [BudgetsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: BUDGET_REPOSITORY, useClass: MikroOrmBudgetRepository },
  ],
})
export class BudgetsModule {}
