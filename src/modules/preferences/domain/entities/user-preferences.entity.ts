import { BaseEntity } from '../../../../shared/domain/base.entity';
import { Currency } from '../enums/currency.enum';
import { DateFormat } from '../enums/date-format.enum';
import { Language } from '../enums/language.enum';

export interface UserPreferencesJSON {
  id: string;
  userId: string;
  currency: Currency;
  dateFormat: DateFormat;
  language: Language;
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  subscriptionReminders: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdatePreferencesProps = Partial<
  Pick<
    UserPreferencesJSON,
    | 'currency'
    | 'dateFormat'
    | 'language'
    | 'emailNotifications'
    | 'pushNotifications'
    | 'budgetAlerts'
    | 'subscriptionReminders'
  >
>;

export class UserPreferences extends BaseEntity {
  public userId: string;
  public currency: Currency;
  public dateFormat: DateFormat;
  public language: Language;
  public emailNotifications: boolean;
  public pushNotifications: boolean;
  public budgetAlerts: boolean;
  public subscriptionReminders: boolean;

  constructor(
    userId: string,
    currency: Currency,
    dateFormat: DateFormat,
    language: Language,
    emailNotifications: boolean,
    pushNotifications: boolean,
    budgetAlerts: boolean,
    subscriptionReminders: boolean,
    id?: string,
  ) {
    super(id);
    this.userId = userId;
    this.currency = currency;
    this.dateFormat = dateFormat;
    this.language = language;
    this.emailNotifications = emailNotifications;
    this.pushNotifications = pushNotifications;
    this.budgetAlerts = budgetAlerts;
    this.subscriptionReminders = subscriptionReminders;
  }

  static createDefaults(userId: string): UserPreferences {
    return new UserPreferences(
      userId,
      Currency.USD,
      DateFormat.MM_DD_YYYY,
      Language.EN,
      true,
      false,
      true,
      true,
    );
  }

  update(props: UpdatePreferencesProps): void {
    if (props.currency !== undefined) this.currency = props.currency;
    if (props.dateFormat !== undefined) this.dateFormat = props.dateFormat;
    if (props.language !== undefined) this.language = props.language;
    if (props.emailNotifications !== undefined) this.emailNotifications = props.emailNotifications;
    if (props.pushNotifications !== undefined) this.pushNotifications = props.pushNotifications;
    if (props.budgetAlerts !== undefined) this.budgetAlerts = props.budgetAlerts;
    if (props.subscriptionReminders !== undefined) this.subscriptionReminders = props.subscriptionReminders;
    this.updatedAt = new Date();
  }

  toJSON(): UserPreferencesJSON {
    return {
      id: this.id,
      userId: this.userId,
      currency: this.currency,
      dateFormat: this.dateFormat,
      language: this.language,
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications,
      budgetAlerts: this.budgetAlerts,
      subscriptionReminders: this.subscriptionReminders,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
