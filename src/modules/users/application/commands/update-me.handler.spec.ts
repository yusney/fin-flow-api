import { UpdateMeHandler } from './update-me.handler';
import { UpdateMeCommand } from './update-me.command';
import { IUserRepository } from '../../../auth/domain/ports/user.repository';
import { IHashingService } from '../../../../shared/application/ports/hashing.port';
import { User } from '../../../auth/domain/entities/user.entity';
import {
  NotFoundException,
  ValidationException,
} from '../../../../shared/domain/exceptions';

describe('UpdateMeHandler', () => {
  let handler: UpdateMeHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashingService: jest.Mocked<IHashingService>;

  const makeUser = (
    overrides?: Partial<{ id: string; name: string; email: string }>,
  ) =>
    User.create({
      name: overrides?.name ?? 'John Doe',
      email: overrides?.email ?? 'john@example.com',
      passwordHash: '$2b$10$currenthash',
      id: overrides?.id ?? 'user-uuid',
    });

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
    handler = new UpdateMeHandler(userRepository, hashingService);
  });

  it('should update name only and return the updated profile', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue(undefined);

    const result = await handler.execute(
      new UpdateMeCommand('user-uuid', 'Jane Doe'),
    );

    expect(result.name).toBe('Jane Doe');
    expect(result).not.toHaveProperty('passwordHash');
    expect(userRepository.update).toHaveBeenCalledWith(user);
    expect(hashingService.compare).not.toHaveBeenCalled();
  });

  it('should update password when currentPassword and newPassword are provided', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(true);
    hashingService.hash.mockResolvedValue('$2b$10$newhash');
    userRepository.update.mockResolvedValue(undefined);

    const result = await handler.execute(
      new UpdateMeCommand(
        'user-uuid',
        undefined,
        'currentPass123',
        'newPass456',
      ),
    );

    expect(result).not.toHaveProperty('passwordHash');
    expect(hashingService.compare).toHaveBeenCalledWith(
      'currentPass123',
      '$2b$10$currenthash',
    );
    expect(hashingService.hash).toHaveBeenCalledWith('newPass456');
    expect(userRepository.update).toHaveBeenCalledWith(user);
  });

  it('should throw ValidationException when currentPassword is wrong', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(false);

    await expect(
      handler.execute(
        new UpdateMeCommand('user-uuid', undefined, 'wrongPass', 'newPass456'),
      ),
    ).rejects.toThrow(ValidationException);

    expect(hashingService.hash).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException when newPassword is provided without currentPassword', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);

    await expect(
      handler.execute(
        new UpdateMeCommand('user-uuid', undefined, undefined, 'newPass456'),
      ),
    ).rejects.toThrow(ValidationException);

    expect(hashingService.compare).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateMeCommand('non-existent', 'Jane')),
    ).rejects.toThrow(NotFoundException);

    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
