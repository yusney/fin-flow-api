import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IBudgetRepository } from '../../domain/ports/budget.repository';
import { Budget } from '../../domain/entities/budget.entity';

@Injectable()
export class MikroOrmBudgetRepository implements IBudgetRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Budget | null> {
    return this.em.findOne(Budget, { id });
  }

  async findByUserAndMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<Budget[]> {
    return this.em.find(Budget, { userId, month, year });
  }

  async findByUserCategoryAndMonth(
    userId: string,
    categoryId: string,
    month: number,
    year: number,
  ): Promise<Budget | null> {
    return this.em.findOne(Budget, { userId, categoryId, month, year });
  }

  async save(budget: Budget): Promise<void> {
    this.em.persist(budget);
    await this.em.flush();
  }

  async update(budget: Budget): Promise<void> {
    await this.em.flush();
  }
}
