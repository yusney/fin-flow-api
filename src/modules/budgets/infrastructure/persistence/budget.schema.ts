import { EntitySchema } from '@mikro-orm/core';
import { Budget } from '../../domain/entities/budget.entity';

export const BudgetSchema = new EntitySchema<Budget>({
  class: Budget,
  tableName: 'budgets',
  indexes: [
    // FK indexes for better JOIN performance (PostgreSQL doesn't auto-index FK columns)
    { properties: ['userId'], name: 'idx_budgets_user_id' },
    { properties: ['categoryId'], name: 'idx_budgets_category_id' },
  ],
  properties: {
    id: { type: 'uuid', primary: true },
    limitAmount: {
      type: 'decimal',
      columnType: 'decimal(12,2)',
      fieldName: 'limit_amount',
    },
    month: { type: 'integer' },
    year: { type: 'integer' },
    categoryId: { type: 'uuid', fieldName: 'category_id' },
    userId: { type: 'uuid', fieldName: 'user_id' },
    createdAt: {
      type: 'datetime',
      fieldName: 'created_at',
      onCreate: () => new Date(),
    },
    updatedAt: {
      type: 'datetime',
      fieldName: 'updated_at',
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
    },
  },
  uniques: [{ properties: ['userId', 'categoryId', 'month', 'year'] }],
});
