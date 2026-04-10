import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserQuery } from './login-user.query';
import { USER_REPOSITORY } from '../../domain/ports/user.repository';
import type { IUserRepository } from '../../domain/ports/user.repository';
import { HASHING_SERVICE } from '../../../../shared/application/ports/hashing.port';
import type { IHashingService } from '../../../../shared/application/ports/hashing.port';
import {
  NotFoundException,
  ValidationException,
} from '../../../../shared/domain/exceptions';

@QueryHandler(LoginUserQuery)
export class LoginUserHandler implements IQueryHandler<LoginUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASHING_SERVICE) private readonly hashingService: IHashingService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: LoginUserQuery): Promise<{ access_token: string }> {
    const user = await this.userRepository.findByEmail(query.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.hashingService.compare(
      query.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new ValidationException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { access_token: token };
  }
}
