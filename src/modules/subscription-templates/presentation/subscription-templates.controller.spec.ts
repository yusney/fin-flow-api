import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SubscriptionTemplatesController } from './subscription-templates.controller';
import { CreateSubscriptionTemplateCommand } from '../application/commands/create-subscription-template.command';
import { UpdateSubscriptionTemplateCommand } from '../application/commands/update-subscription-template.command';
import { DeleteSubscriptionTemplateCommand } from '../application/commands/delete-subscription-template.command';
import { GetSubscriptionTemplatesQuery } from '../application/queries/get-subscription-templates.query';
import { GetSubscriptionTemplateQuery } from '../application/queries/get-subscription-template.query';
import { TemplateCategory } from '../domain/enums/template-category.enum';
import { BillingFrequency } from '../../subscriptions/domain/enums/billing-frequency.enum';

describe('SubscriptionTemplatesController', () => {
  let controller: SubscriptionTemplatesController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionTemplatesController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionTemplatesController>(
      SubscriptionTemplatesController,
    );
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('findAll', () => {
    it('should execute GetSubscriptionTemplatesQuery with userId', async () => {
      const templates = [{ id: 'tpl-1', name: 'Netflix' }];
      queryBus.execute.mockResolvedValue(templates);

      const user = { userId: 'user-uuid' };
      const result = await controller.findAll(user, undefined);

      expect(result).toEqual(templates);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplatesQuery('user-uuid'),
      );
    });

    it('should execute GetSubscriptionTemplatesQuery with userId and category filter', async () => {
      const templates = [{ id: 'tpl-1', name: 'Netflix' }];
      queryBus.execute.mockResolvedValue(templates);

      const user = { userId: 'user-uuid' };
      const result = await controller.findAll(user, TemplateCategory.STREAMING);

      expect(result).toEqual(templates);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplatesQuery(
          'user-uuid',
          TemplateCategory.STREAMING,
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should execute GetSubscriptionTemplateQuery with userId and id', async () => {
      const template = { id: 'tpl-uuid', name: 'Netflix' };
      queryBus.execute.mockResolvedValue(template);

      const user = { userId: 'user-uuid' };
      const result = await controller.findOne('tpl-uuid', user);

      expect(result).toEqual(template);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplateQuery('user-uuid', 'tpl-uuid'),
      );
    });
  });

  describe('create', () => {
    it('should execute CreateSubscriptionTemplateCommand with dto data and userId', async () => {
      const expectedResult = { id: 'tpl-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto = {
        name: 'Netflix',
        category: TemplateCategory.STREAMING,
        defaultFrequency: BillingFrequency.MONTHLY,
        defaultAmount: 14.99,
      };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto as any, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSubscriptionTemplateCommand(
          'Netflix',
          'user-uuid',
          TemplateCategory.STREAMING,
          BillingFrequency.MONTHLY,
          14.99,
          null,
          null,
          null,
        ),
      );
    });

    it('should pass all optional fields when provided', async () => {
      const expectedResult = { id: 'tpl-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto = {
        name: 'Spotify',
        category: TemplateCategory.MUSIC,
        description: 'Music streaming',
        iconUrl: 'https://cdn.example.com/spotify.png',
        serviceUrl: 'https://spotify.com',
        defaultAmount: 9.99,
        defaultFrequency: BillingFrequency.ANNUAL,
      };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto as any, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSubscriptionTemplateCommand(
          'Spotify',
          'user-uuid',
          TemplateCategory.MUSIC,
          BillingFrequency.ANNUAL,
          9.99,
          'Music streaming',
          'https://cdn.example.com/spotify.png',
          'https://spotify.com',
        ),
      );
    });
  });

  describe('update', () => {
    it('should execute UpdateSubscriptionTemplateCommand with dto, id, and userId', async () => {
      const expectedResult = { id: 'tpl-uuid', name: 'Netflix Premium' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto = { name: 'Netflix Premium' };
      const user = { userId: 'user-uuid' };
      const result = await controller.update('tpl-uuid', dto as any, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateSubscriptionTemplateCommand(
          'tpl-uuid',
          'user-uuid',
          'Netflix Premium',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should execute DeleteSubscriptionTemplateCommand with id and userId', async () => {
      commandBus.execute.mockResolvedValue(undefined);

      const user = { userId: 'user-uuid' };
      const result = await controller.remove('tpl-uuid', user);

      expect(result).toBeUndefined();
      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteSubscriptionTemplateCommand('tpl-uuid', 'user-uuid'),
      );
    });
  });
});
