import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { USER_REPOSITORY } from '../../domain/ports/user.repository';
import type { IUserRepository } from '../../domain/ports/user.repository';
import { HASHING_SERVICE } from '../../../../shared/application/ports/hashing.port';
import type { IHashingService } from '../../../../shared/application/ports/hashing.port';
import { User } from '../../domain/entities/user.entity';
import { ConflictException } from '../../../../shared/domain/exceptions';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASHING_SERVICE) private readonly hashingService: IHashingService,
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

    await this.userRepository.save(user);

    return { id: user.id };
  }
}
