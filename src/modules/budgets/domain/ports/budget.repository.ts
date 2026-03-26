import { Budget } from '../entities/budget.entity';

export const BUDGET_REPOSITORY = 'BUDGET_REPOSITORY';

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findByUserAndMonth(userId: string, month: number, year: number): Promise<Budget[]>;
  findByUserCategoryAndMonth(userId: string, categoryId: string, month: number, year: number): Promise<Budget | null>;
  save(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
}
