import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IUserPreferencesRepository } from '../../domain/ports/user-preferences.repository';
import { UserPreferences } from '../../domain/entities/user-preferences.entity';

@Injectable()
export class MikroOrmUserPreferencesRepository implements IUserPreferencesRepository {
  constructor(private readonly em: EntityManager) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.em.findOne(UserPreferences, { userId });
  }

  async save(prefs: UserPreferences): Promise<void> {
    this.em.persist(prefs);
    await this.em.flush();
  }
}
