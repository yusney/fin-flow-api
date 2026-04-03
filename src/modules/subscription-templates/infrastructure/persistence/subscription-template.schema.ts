import { EntitySchema } from '@mikro-orm/core';
import { SubscriptionTemplate } from '../../domain/entities/subscription-template.entity';

export const SubscriptionTemplateSchema =
  new EntitySchema<SubscriptionTemplate>({
    class: SubscriptionTemplate,
    tableName: 'subscription_templates',
    indexes: [
      {
        properties: ['category'],
        name: 'idx_subscription_templates_template_category',
      },
    ],
    properties: {
      id: { type: 'uuid', primary: true },
      name: { type: 'string', length: 100 },
      description: { type: 'string', length: 500, nullable: true },
      iconUrl: {
        type: 'string',
        fieldName: 'icon_url',
        length: 2048,
        nullable: true,
      },
      serviceUrl: {
        type: 'string',
        fieldName: 'service_url',
        length: 2048,
        nullable: true,
      },
      defaultAmount: {
        type: 'decimal',
        fieldName: 'default_amount',
        columnType: 'decimal(12,2)',
      },
      defaultFrequency: {
        type: 'string',
        fieldName: 'default_frequency',
        length: 20,
        default: 'MONTHLY',
      },
      category: { type: 'string', fieldName: 'template_category', length: 30 },
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
    uniques: [
      {
        properties: ['name'],
        name: 'uq_subscription_templates_name',
      },
    ],
  });
