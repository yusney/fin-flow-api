import { Category } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  save(category: Category): Promise<void>;
  delete(category: Category): Promise<void>;
}
