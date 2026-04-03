import { EntitySchema } from '@mikro-orm/core';
import { Subscription } from '../../domain/entities/subscription.entity';

export const SubscriptionSchema = new EntitySchema<Subscription>({
  class: Subscription,
  tableName: 'subscriptions',
  indexes: [
    // FK indexes for JOIN performance
    { properties: ['userId'], name: 'idx_subscriptions_user_id' },
    { properties: ['categoryId'], name: 'idx_subscriptions_category_id' },
    // Indexes for filtering and sorting
    { properties: ['billingDay'], name: 'idx_subscriptions_billing_day' },
    { properties: ['frequency'], name: 'idx_subscriptions_frequency' },
    { properties: ['startDate'], name: 'idx_subscriptions_start_date' },
    // Versioning index
    { properties: ['parentId'], name: 'idx_subscriptions_parent_id' },
  ],
  properties: {
    id: { type: 'uuid', primary: true },
    amount: { type: 'decimal', columnType: 'decimal(12,2)' },
    description: { type: 'string', length: 255 },
    billingDay: { type: 'integer', fieldName: 'billing_day' },
    categoryId: { type: 'uuid', fieldName: 'category_id' },
    userId: { type: 'uuid', fieldName: 'user_id' },
    isActive: { type: 'boolean', fieldName: 'is_active', default: true },
    startDate: { type: 'datetime', fieldName: 'start_date' },
    endDate: { type: 'datetime', fieldName: 'end_date', nullable: true },
    frequency: {
      type: 'string',
      fieldName: 'frequency',
      default: 'MONTHLY',
      length: 20,
    },
    type: { type: 'string', fieldName: 'type', default: 'GENERAL', length: 20 },
    serviceUrl: {
      type: 'string',
      fieldName: 'service_url',
      nullable: true,
      length: 2048,
    },
    parentId: {
      type: 'uuid',
      fieldName: 'parent_id',
      nullable: true,
    },
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
