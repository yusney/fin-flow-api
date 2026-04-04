import { UpdatePreferencesProps } from '../../domain/entities/user-preferences.entity';

export class UpdatePreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly props: UpdatePreferencesProps,
  ) {}
}
