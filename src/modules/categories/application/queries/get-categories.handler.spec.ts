import { GetCategoriesHandler } from './get-categories.handler';
import { GetCategoriesQuery } from './get-categories.query';
import { ICategoryRepository } from '../../domain/ports/category.repository';
import { Category } from '../../domain/entities/category.entity';

describe('GetCategoriesHandler', () => {
  let handler: GetCategoriesHandler;
  let categoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    categoryRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    handler = new GetCategoriesHandler(categoryRepository);
  });

  it('should return array of categories for the given userId', async () => {
    const categories = [
      Category.create({ name: 'Food', type: 'expense', userId: 'user-uuid' }),
      Category.create({
        name: 'Salary',
        type: 'income',
        userId: 'user-uuid',
      }),
    ];
    categoryRepository.findByUserId.mockResolvedValue(categories);

    const query = new GetCategoriesQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result).toEqual(categories);
    expect(categoryRepository.findByUserId).toHaveBeenCalledWith('user-uuid');
  });

  it('should return empty array when user has no categories', async () => {
    categoryRepository.findByUserId.mockResolvedValue([]);

    const query = new GetCategoriesQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result).toEqual([]);
  });
});
