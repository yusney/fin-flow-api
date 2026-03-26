import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ICategoryRepository } from '../../domain/ports/category.repository';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class MikroOrmCategoryRepository implements ICategoryRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Category | null> {
    return this.em.findOne(Category, { id });
  }

  async findByUserId(userId: string): Promise<Category[]> {
    return this.em.find(Category, { userId });
  }

  async save(category: Category): Promise<void> {
    this.em.persist(category);
    await this.em.flush();
  }

  async delete(category: Category): Promise<void> {
    this.em.remove(category);
    await this.em.flush();
  }
}
