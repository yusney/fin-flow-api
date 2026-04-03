import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from './register-user.command';
import { IUserRepository } from '../../domain/ports/user.repository';
import { IHashingService } from '../../../../shared/application/ports/hashing.port';
import { IUserPreferencesRepository } from '../../../preferences/domain/ports/user-preferences.repository';
import { User } from '../../domain/entities/user.entity';
import { UserPreferences } from '../../../preferences/domain/entities/user-preferences.entity';
import { ConflictException } from '../../../../shared/domain/exceptions';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashingService: jest.Mocked<IHashingService>;
  let preferencesRepository: jest.Mocked<IUserPreferencesRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      persist: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    hashingService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    preferencesRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    handler = new RegisterUserHandler(
      userRepository,
      hashingService,
      preferencesRepository,
    );
  });

  it('should register a user with default preferences and return { id }', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashingService.hash.mockResolvedValue('hashed-password');
    preferencesRepository.save.mockResolvedValue(undefined);

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
    expect(userRepository.persist).toHaveBeenCalledWith(expect.any(User));
    expect(preferencesRepository.save).toHaveBeenCalledWith(
      expect.any(UserPreferences),
    );
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
    expect(userRepository.persist).not.toHaveBeenCalled();
    expect(preferencesRepository.save).not.toHaveBeenCalled();
  });
});
