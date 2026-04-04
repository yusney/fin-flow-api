import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Currency } from '../../domain/enums/currency.enum';
import { DateFormat } from '../../domain/enums/date-format.enum';
import { Language } from '../../domain/enums/language.enum';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  budgetAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  subscriptionReminders?: boolean;
}
