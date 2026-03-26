import { EntitySchema } from '@mikro-orm/core';
import { Transaction } from '../../domain/entities/transaction.entity';

export const TransactionSchema = new EntitySchema<Transaction>({
  class: Transaction,
  tableName: 'transactions',
  properties: {
    id: { type: 'uuid', primary: true },
    amount: { type: 'decimal', columnType: 'decimal(12,2)' },
    description: { type: 'string', length: 255 },
    date: { type: 'date', fieldName: 'date' },
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
});
