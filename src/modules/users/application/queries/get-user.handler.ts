import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { USER_REPOSITORY } from '../../../auth/domain/ports/user.repository';
import type { IUserRepository } from '../../../auth/domain/ports/user.repository';
import type { UserPublicJSON } from '../../domain/entities/user-profile.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<UserPublicJSON> {
    const user = await this.userRepository.findById(query.targetUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { id: user.id, name: user.name };
  }
}
