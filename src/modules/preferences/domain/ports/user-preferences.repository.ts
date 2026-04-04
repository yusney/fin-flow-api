import { UserPreferences } from '../entities/user-preferences.entity';

export const USER_PREFERENCES_REPOSITORY = 'USER_PREFERENCES_REPOSITORY';

export interface IUserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  save(prefs: UserPreferences): Promise<void>;
}
