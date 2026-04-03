import { JwtService } from '@nestjs/jwt';
import { LoginUserHandler } from './login-user.handler';
import { LoginUserQuery } from './login-user.query';
import { IUserRepository } from '../../domain/ports/user.repository';
import { IHashingService } from '../../../../shared/application/ports/hashing.port';
import { User } from '../../domain/entities/user.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../../../shared/domain/exceptions';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashingService: jest.Mocked<IHashingService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      persist: jest.fn(),
      update: jest.fn(),
    };
    hashingService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    handler = new LoginUserHandler(userRepository, hashingService, jwtService);
  });

  it('should return access_token for valid credentials', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      id: 'user-uuid',
    });
    userRepository.findByEmail.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('jwt-token-123');

    const query = new LoginUserQuery('john@example.com', 'password123');
    const result = await handler.execute(query);

    expect(result).toEqual({ access_token: 'jwt-token-123' });
    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(hashingService.compare).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-uuid',
      email: 'john@example.com',
    });
  });

  it('should throw NotFoundException when email not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const query = new LoginUserQuery('unknown@example.com', 'password123');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should throw ValidationException when password is wrong', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
    });
    userRepository.findByEmail.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(false);

    const query = new LoginUserQuery('john@example.com', 'wrong-password');

    await expect(handler.execute(query)).rejects.toThrow(ValidationException);
  });
});
