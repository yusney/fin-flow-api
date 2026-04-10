import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCategoryCommand } from './create-category.command';
import { CATEGORY_REPOSITORY } from '../../domain/ports/category.repository';
import type { ICategoryRepository } from '../../domain/ports/category.repository';
import { Category } from '../../domain/entities/category.entity';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<{ id: string }> {
    const category = Category.create({
      name: command.name,
      type: command.type,
      userId: command.userId,
    });

    await this.categoryRepository.save(category);

    return { id: category.id };
  }
}
