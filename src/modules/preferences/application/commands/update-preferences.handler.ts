import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePreferencesCommand } from './update-preferences.command';
import { USER_PREFERENCES_REPOSITORY } from '../../domain/ports/user-preferences.repository';
import type { IUserPreferencesRepository } from '../../domain/ports/user-preferences.repository';
import { NotFoundException } from '../../../../shared/domain/exceptions';
import { UserPreferencesJSON } from '../../domain/entities/user-preferences.entity';

@CommandHandler(UpdatePreferencesCommand)
export class UpdatePreferencesHandler implements ICommandHandler<UpdatePreferencesCommand> {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    command: UpdatePreferencesCommand,
  ): Promise<UserPreferencesJSON> {
    const prefs = await this.preferencesRepository.findByUserId(command.userId);
    if (!prefs) {
      throw new NotFoundException('Preferences not found');
    }
    prefs.update(command.props);
    await this.preferencesRepository.save(prefs);
    return prefs.toJSON();
  }
}
