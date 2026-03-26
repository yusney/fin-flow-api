import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCategoriesQuery } from './get-categories.query';
import { CATEGORY_REPOSITORY } from '../../domain/ports/category.repository';
import type { ICategoryRepository } from '../../domain/ports/category.repository';
import { Category } from '../../domain/entities/category.entity';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler
  implements IQueryHandler<GetCategoriesQuery>
{
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoriesQuery): Promise<Category[]> {
    return this.categoryRepository.findByUserId(query.userId);
  }
}
