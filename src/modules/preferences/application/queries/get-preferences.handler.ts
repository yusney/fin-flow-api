import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPreferencesQuery } from './get-preferences.query';
import { USER_PREFERENCES_REPOSITORY } from '../../domain/ports/user-preferences.repository';
import type { IUserPreferencesRepository } from '../../domain/ports/user-preferences.repository';
import { NotFoundException } from '../../../../shared/domain/exceptions';
import { UserPreferencesJSON } from '../../domain/entities/user-preferences.entity';

@QueryHandler(GetPreferencesQuery)
export class GetPreferencesHandler implements IQueryHandler<GetPreferencesQuery> {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(query: GetPreferencesQuery): Promise<UserPreferencesJSON> {
    const prefs = await this.preferencesRepository.findByUserId(query.userId);
    if (!prefs) {
      throw new NotFoundException('Preferences not found');
    }
    return prefs.toJSON();
  }
}
