import { UserPreferences } from './user-preferences.entity';
import { Currency } from '../enums/currency.enum';
import { DateFormat } from '../enums/date-format.enum';
import { Language } from '../enums/language.enum';

describe('UserPreferences', () => {
  describe('createDefaults', () => {
    it('should create preferences with correct defaults', () => {
      const prefs = UserPreferences.createDefaults('user-uuid');

      expect(prefs.userId).toBe('user-uuid');
      expect(prefs.currency).toBe(Currency.USD);
      expect(prefs.dateFormat).toBe(DateFormat.MM_DD_YYYY);
      expect(prefs.language).toBe(Language.EN);
      expect(prefs.emailNotifications).toBe(true);
      expect(prefs.pushNotifications).toBe(false);
      expect(prefs.budgetAlerts).toBe(true);
      expect(prefs.subscriptionReminders).toBe(true);
      expect(prefs.id).toBeDefined();
      expect(prefs.createdAt).toBeInstanceOf(Date);
      expect(prefs.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('should update only provided fields', () => {
      const prefs = UserPreferences.createDefaults('user-uuid');
      prefs.update({ currency: Currency.EUR, emailNotifications: false });

      expect(prefs.currency).toBe(Currency.EUR);
      expect(prefs.emailNotifications).toBe(false);
      expect(prefs.dateFormat).toBe(DateFormat.MM_DD_YYYY);
      expect(prefs.language).toBe(Language.EN);
    });

    it('should update updatedAt when any field changes', () => {
      const prefs = UserPreferences.createDefaults('user-uuid');
      const before = prefs.updatedAt;
      prefs.update({ pushNotifications: true });

      expect(prefs.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('should be a no-op when called with empty object', () => {
      const prefs = UserPreferences.createDefaults('user-uuid');
      const snapshot = prefs.toJSON();
      prefs.update({});

      expect(prefs.currency).toBe(snapshot.currency);
      expect(prefs.language).toBe(snapshot.language);
    });
  });

  describe('toJSON', () => {
    it('should serialize all fields', () => {
      const prefs = UserPreferences.createDefaults('user-uuid');
      const json = prefs.toJSON();

      expect(json).toMatchObject({
        id: expect.any(String),
        userId: 'user-uuid',
        currency: Currency.USD,
        dateFormat: DateFormat.MM_DD_YYYY,
        language: Language.EN,
        emailNotifications: true,
        pushNotifications: false,
        budgetAlerts: true,
        subscriptionReminders: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
