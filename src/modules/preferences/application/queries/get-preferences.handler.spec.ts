import { GetPreferencesHandler } from './get-preferences.handler';
import { GetPreferencesQuery } from './get-preferences.query';
import { IUserPreferencesRepository } from '../../domain/ports/user-preferences.repository';
import { UserPreferences } from '../../domain/entities/user-preferences.entity';
import { NotFoundException } from '../../../../shared/domain/exceptions';

describe('GetPreferencesHandler', () => {
  let handler: GetPreferencesHandler;
  let preferencesRepository: jest.Mocked<IUserPreferencesRepository>;

  beforeEach(() => {
    preferencesRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    handler = new GetPreferencesHandler(preferencesRepository);
  });

  it('should return preferences JSON when found', async () => {
    const prefs = UserPreferences.createDefaults('user-uuid');
    preferencesRepository.findByUserId.mockResolvedValue(prefs);

    const result = await handler.execute(new GetPreferencesQuery('user-uuid'));

    expect(result).toEqual(prefs.toJSON());
    expect(preferencesRepository.findByUserId).toHaveBeenCalledWith(
      'user-uuid',
    );
  });

  it('should throw NotFoundException when preferences do not exist', async () => {
    preferencesRepository.findByUserId.mockResolvedValue(null);

    await expect(
      handler.execute(new GetPreferencesQuery('user-uuid')),
    ).rejects.toThrow(NotFoundException);
  });
});
