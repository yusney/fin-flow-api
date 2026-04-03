import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateBudgetCommand } from './create-budget.command';
import { BUDGET_REPOSITORY } from '../../domain/ports/budget.repository';
import type { IBudgetRepository } from '../../domain/ports/budget.repository';
import { CATEGORY_REPOSITORY } from '../../../categories/domain/ports/category.repository';
import type { ICategoryRepository } from '../../../categories/domain/ports/category.repository';
import { Budget } from '../../domain/entities/budget.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../../../shared/domain/exceptions';

@CommandHandler(CreateBudgetCommand)
export class CreateBudgetHandler implements ICommandHandler<CreateBudgetCommand> {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateBudgetCommand) {
    const category = await this.categoryRepository.findById(command.categoryId);

    if (!category || category.userId !== command.userId) {
      throw new NotFoundException('Category not found');
    }

    if (category.type !== 'expense') {
      throw new ValidationException(
        'Budget can only be set for expense categories',
      );
    }

    const existingBudget =
      await this.budgetRepository.findByUserCategoryAndMonth(
        command.userId,
        command.categoryId,
        command.month,
        command.year,
      );

    if (existingBudget) {
      existingBudget.limitAmount = command.limitAmount;
      await this.budgetRepository.update(existingBudget);
      return existingBudget.toJSON();
    }

    const budget = Budget.create({
      limitAmount: command.limitAmount,
      month: command.month,
      year: command.year,
      categoryId: command.categoryId,
      userId: command.userId,
    });

    await this.budgetRepository.save(budget);

    return budget.toJSON();
  }
}
