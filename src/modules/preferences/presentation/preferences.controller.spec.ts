import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PreferencesController } from './preferences.controller';
import { GetPreferencesQuery } from '../application/queries/get-preferences.query';
import { UpdatePreferencesCommand } from '../application/commands/update-preferences.command';
import { UserPreferences } from '../domain/entities/user-preferences.entity';
import { Currency } from '../domain/enums/currency.enum';

describe('PreferencesController', () => {
  let controller: PreferencesController;
  let queryBus: jest.Mocked<QueryBus>;
  let commandBus: jest.Mocked<CommandBus>;

  const mockUser = { userId: 'user-uuid' };
  const mockPrefsJSON = UserPreferences.createDefaults('user-uuid').toJSON();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreferencesController],
      providers: [
        { provide: QueryBus, useValue: { execute: jest.fn() } },
        { provide: CommandBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get(PreferencesController);
    queryBus = module.get(QueryBus);
    commandBus = module.get(CommandBus);
  });

  describe('GET /api/preferences', () => {
    it('should delegate to GetPreferencesQuery and return result', async () => {
      queryBus.execute.mockResolvedValue(mockPrefsJSON);

      const result = await controller.getPreferences(mockUser);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetPreferencesQuery('user-uuid'),
      );
      expect(result).toEqual(mockPrefsJSON);
    });
  });

  describe('PATCH /api/preferences', () => {
    it('should delegate to UpdatePreferencesCommand and return updated result', async () => {
      const dto = { currency: Currency.EUR };
      const updated = { ...mockPrefsJSON, currency: Currency.EUR };
      commandBus.execute.mockResolvedValue(updated);

      const result = await controller.updatePreferences(mockUser, dto);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdatePreferencesCommand('user-uuid', dto),
      );
      expect(result).toEqual(updated);
    });

    it('should handle empty body (no-op)', async () => {
      commandBus.execute.mockResolvedValue(mockPrefsJSON);

      const result = await controller.updatePreferences(mockUser, {});

      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockPrefsJSON);
    });
  });
});
