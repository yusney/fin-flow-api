import { GetUserHandler } from './get-user.handler';
import { GetUserQuery } from './get-user.query';
import { IUserRepository } from '../../../auth/domain/ports/user.repository';
import { User } from '../../../auth/domain/entities/user.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('GetUserHandler', () => {
  let handler: GetUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      persist: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    handler = new GetUserHandler(userRepository);
  });

  it('should return only { id, name } for the target user', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      id: 'user-uuid',
    });
    userRepository.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetUserQuery('user-uuid'));

    expect(result).toEqual({ id: 'user-uuid', name: 'John Doe' });
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('createdAt');
    expect(userRepository.findById).toHaveBeenCalledWith('user-uuid');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new GetUserQuery('non-existent-id')),
    ).rejects.toThrow(NotFoundException);
  });
});
