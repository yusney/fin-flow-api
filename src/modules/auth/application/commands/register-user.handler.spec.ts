import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from './register-user.command';
import { IUserRepository } from '../../domain/ports/user.repository';
import { IHashingService } from '../../../../shared/application/ports/hashing.port';
import { User } from '../../domain/entities/user.entity';
import { ConflictException } from '../../../../shared/domain/exceptions';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashingService: jest.Mocked<IHashingService>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    hashingService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    handler = new RegisterUserHandler(userRepository, hashingService);
  });

  it('should register a user with valid data and return { id }', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashingService.hash.mockResolvedValue('hashed-password');
    userRepository.save.mockResolvedValue(undefined);

    const command = new RegisterUserCommand(
      'John Doe',
      'john@example.com',
      'password123',
    );
    const result = await handler.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(hashingService.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
  });

  it('should throw ConflictException when email is already taken', async () => {
    const existingUser = User.create({
      name: 'Existing',
      email: 'john@example.com',
      passwordHash: 'hash',
    });
    userRepository.findByEmail.mockResolvedValue(existingUser);

    const command = new RegisterUserCommand(
      'John Doe',
      'john@example.com',
      'password123',
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
