import { GetMeHandler } from './get-me.handler';
import { GetMeQuery } from './get-me.query';
import { IUserRepository } from '../../../auth/domain/ports/user.repository';
import { User } from '../../../auth/domain/entities/user.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('GetMeHandler', () => {
  let handler: GetMeHandler;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      persist: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    handler = new GetMeHandler(userRepository);
  });

  it('should return the user profile as UserJSON', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      id: 'user-uuid',
    });
    userRepository.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetMeQuery('user-uuid'));

    expect(result).toEqual({
      id: 'user-uuid',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(userRepository.findById).toHaveBeenCalledWith('user-uuid');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new GetMeQuery('non-existent-id')),
    ).rejects.toThrow(NotFoundException);

    expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
