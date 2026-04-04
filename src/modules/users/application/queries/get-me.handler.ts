import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMeQuery } from './get-me.query';
import { USER_REPOSITORY } from '../../../auth/domain/ports/user.repository';
import type { IUserRepository } from '../../../auth/domain/ports/user.repository';
import type { UserProfileJSON } from '../../domain/entities/user-profile.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetMeQuery): Promise<UserProfileJSON> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.toJSON();
  }
}
