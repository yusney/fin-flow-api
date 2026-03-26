import { EntitySchema } from '@mikro-orm/core';
import { User } from '../../domain/entities/user.entity';

export const UserSchema = new EntitySchema<User>({
  class: User,
  tableName: 'users',
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'string', length: 255 },
    email: { type: 'string', length: 255, unique: true },
    passwordHash: {
      type: 'string',
      length: 255,
      fieldName: 'password_hash',
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
