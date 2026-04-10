import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { USER_REPOSITORY } from '../../domain/ports/user.repository';
import type { IUserRepository } from '../../domain/ports/user.repository';
import { HASHING_SERVICE } from '../../../../shared/application/ports/hashing.port';
import type { IHashingService } from '../../../../shared/application/ports/hashing.port';
import { USER_PREFERENCES_REPOSITORY } from '../../../preferences/domain/ports/user-preferences.repository';
import type { IUserPreferencesRepository } from '../../../preferences/domain/ports/user-preferences.repository';
import { User } from '../../domain/entities/user.entity';
import { UserPreferences } from '../../../preferences/domain/entities/user-preferences.entity';
import { ConflictException } from '../../../../shared/domain/exceptions';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASHING_SERVICE) private readonly hashingService: IHashingService,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ id: string }> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashingService.hash(command.password);
    const user = User.create({
      name: command.name,
      email: command.email,
      passwordHash,
    });
    const prefs = UserPreferences.createDefaults(user.id);

    // persist(user) marks user for insert without flushing.
    // preferencesRepository.save(prefs) flushes both in a single transaction.
    this.userRepository.persist(user);
    await this.preferencesRepository.save(prefs);

    return { id: user.id };
  }
}
