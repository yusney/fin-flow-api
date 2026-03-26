import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CATEGORY_REPOSITORY } from './domain/ports/category.repository';
import { MikroOrmCategoryRepository } from './infrastructure/persistence/mikro-orm-category.repository';
import { CreateCategoryHandler } from './application/commands/create-category.handler';
import { GetCategoriesHandler } from './application/queries/get-categories.handler';
import { CategoriesController } from './presentation/categories.controller';

const CommandHandlers = [CreateCategoryHandler];
const QueryHandlers = [GetCategoriesHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CategoriesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: CATEGORY_REPOSITORY, useClass: MikroOrmCategoryRepository },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
