import { CreateBudgetHandler } from './create-budget.handler';
import { CreateBudgetCommand } from './create-budget.command';
import { IBudgetRepository } from '../../domain/ports/budget.repository';
import { ICategoryRepository } from '../../../categories/domain/ports/category.repository';
import { Budget } from '../../domain/entities/budget.entity';
import { Category } from '../../../categories/domain/entities/category.entity';
import {
  ValidationException,
  NotFoundException,
} from '../../../../shared/domain/exceptions';

describe('CreateBudgetHandler', () => {
  let handler: CreateBudgetHandler;
  let budgetRepository: jest.Mocked<IBudgetRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    budgetRepository = {
      findById: jest.fn(),
      findByUserAndMonth: jest.fn(),
      findByUserCategoryAndMonth: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    categoryRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    handler = new CreateBudgetHandler(budgetRepository, categoryRepository);
  });

  it('should create a budget for an expense category and return { id }', async () => {
    const expenseCategory = Category.create({
      name: 'Food',
      type: 'expense',
      userId: 'user-uuid',
    });
    categoryRepository.findById.mockResolvedValue(expenseCategory);
    budgetRepository.findByUserCategoryAndMonth.mockResolvedValue(null);
    budgetRepository.save.mockResolvedValue(undefined);

    const command = new CreateBudgetCommand(
      5000,
      3,
      2026,
      expenseCategory.id,
      'user-uuid',
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(budgetRepository.save).toHaveBeenCalledWith(expect.any(Budget));
  });

  it('should throw ValidationException when category is of type income', async () => {
    const incomeCategory = Category.create({
      name: 'Salary',
      type: 'income',
      userId: 'user-uuid',
    });
    categoryRepository.findById.mockResolvedValue(incomeCategory);

    const command = new CreateBudgetCommand(
      5000,
      3,
      2026,
      incomeCategory.id,
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(ValidationException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Budget can only be set for expense categories',
    );
  });

  it('should throw NotFoundException when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    const command = new CreateBudgetCommand(
      5000,
      3,
      2026,
      'non-existent-id',
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when category belongs to another user', async () => {
    const otherUserCategory = Category.create({
      name: 'Food',
      type: 'expense',
      userId: 'other-user-uuid',
    });
    categoryRepository.findById.mockResolvedValue(otherUserCategory);

    const command = new CreateBudgetCommand(
      5000,
      3,
      2026,
      otherUserCategory.id,
      'user-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should update existing budget instead of creating new one for same user+category+month+year', async () => {
    const expenseCategory = Category.create({
      name: 'Food',
      type: 'expense',
      userId: 'user-uuid',
    });
    const existingBudget = Budget.create({
      limitAmount: 3000,
      month: 3,
      year: 2026,
      categoryId: expenseCategory.id,
      userId: 'user-uuid',
    });

    categoryRepository.findById.mockResolvedValue(expenseCategory);
    budgetRepository.findByUserCategoryAndMonth.mockResolvedValue(
      existingBudget,
    );
    budgetRepository.update.mockResolvedValue(undefined);

    const command = new CreateBudgetCommand(
      5000,
      3,
      2026,
      expenseCategory.id,
      'user-uuid',
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id', existingBudget.id);
    expect(existingBudget.limitAmount).toBe(5000);
    expect(budgetRepository.update).toHaveBeenCalledWith(existingBudget);
    expect(budgetRepository.save).not.toHaveBeenCalled();
  });
});
