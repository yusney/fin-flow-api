import { UpdatePreferencesHandler } from './update-preferences.handler';
import { UpdatePreferencesCommand } from './update-preferences.command';
import { IUserPreferencesRepository } from '../../domain/ports/user-preferences.repository';
import { UserPreferences } from '../../domain/entities/user-preferences.entity';
import { Currency } from '../../domain/enums/currency.enum';
import { Language } from '../../domain/enums/language.enum';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('UpdatePreferencesHandler', () => {
  let handler: UpdatePreferencesHandler;
  let preferencesRepository: jest.Mocked<IUserPreferencesRepository>;

  beforeEach(() => {
    preferencesRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    handler = new UpdatePreferencesHandler(preferencesRepository);
  });

  it('should update a single field and return updated preferences', async () => {
    const prefs = UserPreferences.createDefaults('user-uuid');
    preferencesRepository.findByUserId.mockResolvedValue(prefs);
    preferencesRepository.save.mockResolvedValue(undefined);

    const result = await handler.execute(
      new UpdatePreferencesCommand('user-uuid', { currency: Currency.EUR }),
    );

    expect(result.currency).toBe(Currency.EUR);
    expect(preferencesRepository.save).toHaveBeenCalledWith(prefs);
  });

  it('should update multiple fields at once', async () => {
    const prefs = UserPreferences.createDefaults('user-uuid');
    preferencesRepository.findByUserId.mockResolvedValue(prefs);
    preferencesRepository.save.mockResolvedValue(undefined);

    const result = await handler.execute(
      new UpdatePreferencesCommand('user-uuid', {
        language: Language.ES,
        pushNotifications: true,
        budgetAlerts: false,
      }),
    );

    expect(result.language).toBe(Language.ES);
    expect(result.pushNotifications).toBe(true);
    expect(result.budgetAlerts).toBe(false);
  });

  it('should be a no-op when called with empty props', async () => {
    const prefs = UserPreferences.createDefaults('user-uuid');
    const snapshot = prefs.toJSON();
    preferencesRepository.findByUserId.mockResolvedValue(prefs);
    preferencesRepository.save.mockResolvedValue(undefined);

    const result = await handler.execute(
      new UpdatePreferencesCommand('user-uuid', {}),
    );

    expect(result.currency).toBe(snapshot.currency);
    expect(result.language).toBe(snapshot.language);
  });

  it('should throw NotFoundException when preferences do not exist', async () => {
    preferencesRepository.findByUserId.mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdatePreferencesCommand('user-uuid', { currency: Currency.EUR }),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(preferencesRepository.save).not.toHaveBeenCalled();
  });
});
