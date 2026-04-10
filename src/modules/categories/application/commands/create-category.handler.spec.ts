import { CreateCategoryHandler } from './create-category.handler';
import { CreateCategoryCommand } from './create-category.command';
import { ICategoryRepository } from '../../domain/ports/category.repository';
import { Category } from '../../domain/entities/category.entity';

describe('CreateCategoryHandler', () => {
  let handler: CreateCategoryHandler;
  let categoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    categoryRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    handler = new CreateCategoryHandler(categoryRepository);
  });

  it('should create a category with valid data and return { id }', async () => {
    categoryRepository.save.mockResolvedValue(undefined);

    const command = new CreateCategoryCommand('Food', 'expense', 'user-uuid');
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(categoryRepository.save).toHaveBeenCalledWith(expect.any(Category));
  });
});
