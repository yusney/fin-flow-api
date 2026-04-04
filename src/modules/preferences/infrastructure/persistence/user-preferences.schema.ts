import { EntitySchema } from '@mikro-orm/core';
import { UserPreferences } from '../../domain/entities/user-preferences.entity';

export const UserPreferencesSchema = new EntitySchema<UserPreferences>({
  class: UserPreferences,
  tableName: 'user_preferences',
  properties: {
    id: { type: 'uuid', primary: true },
    userId: { type: 'uuid', fieldName: 'user_id', unique: true },
    currency: { type: 'string', length: 3 },
    dateFormat: { type: 'string', length: 10, fieldName: 'date_format' },
    language: { type: 'string', length: 2 },
    emailNotifications: { type: 'boolean', fieldName: 'email_notifications', default: true },
    pushNotifications: { type: 'boolean', fieldName: 'push_notifications', default: false },
    budgetAlerts: { type: 'boolean', fieldName: 'budget_alerts', default: true },
    subscriptionReminders: { type: 'boolean', fieldName: 'subscription_reminders', default: true },
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
