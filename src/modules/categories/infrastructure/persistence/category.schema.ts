import { EntitySchema } from '@mikro-orm/core';
import { Category } from '../../domain/entities/category.entity';

export const CategorySchema = new EntitySchema<Category>({
  class: Category,
  tableName: 'categories',
  indexes: [
    // FK index for user lookups
    { properties: ['userId'], name: 'idx_categories_user_id' },
  ],
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'string', length: 100 },
    type: { type: 'string', length: 10 },
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
});
