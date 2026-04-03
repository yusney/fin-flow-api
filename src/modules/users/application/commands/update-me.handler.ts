import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateMeCommand } from './update-me.command';
import { USER_REPOSITORY } from '../../../auth/domain/ports/user.repository';
import type { IUserRepository } from '../../../auth/domain/ports/user.repository';
import { HASHING_SERVICE } from '../../../../shared/application/ports/hashing.port';
import type { IHashingService } from '../../../../shared/application/ports/hashing.port';
import type { UserProfileJSON } from '../../domain/entities/user-profile.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../../../shared/domain/exceptions';

@CommandHandler(UpdateMeCommand)
export class UpdateMeHandler implements ICommandHandler<UpdateMeCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async execute(command: UpdateMeCommand): Promise<UserProfileJSON> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (command.newPassword) {
      if (!command.currentPassword) {
        throw new ValidationException(
          'Current password is required to set a new password',
        );
      }

      const isCurrentPasswordValid = await this.hashingService.compare(
        command.currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        throw new ValidationException('Current password is incorrect');
      }

      const hashedNewPassword = await this.hashingService.hash(
        command.newPassword,
      );
      user.updatePassword(hashedNewPassword);
    }

    if (command.name) {
      user.updateName(command.name);
    }

    await this.userRepository.update(user);

    return user.toJSON();
  }
}
