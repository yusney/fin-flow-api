import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { SubscriptionTemplatesController } from './subscription-templates.controller';
import { GetSubscriptionTemplatesQuery } from '../application/queries/get-subscription-templates.query';
import { GetSubscriptionTemplateQuery } from '../application/queries/get-subscription-template.query';
import { GetSubscriptionPrefillQuery } from '../application/queries/get-subscription-prefill.query';
import { CreateSubscriptionTemplateCommand } from '../application/commands/create-subscription-template.command';
import { TemplateCategory } from '../domain/enums/template-category.enum';
import { BillingFrequency } from '../../subscriptions/domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../subscriptions/domain/enums/subscription-type.enum';
import { CreateSubscriptionTemplateDto } from './dtos/create-subscription-template.dto';

const MOCK_USER = { sub: 'user-uuid-1234', email: 'test@example.com' };

describe('SubscriptionTemplatesController', () => {
  let controller: SubscriptionTemplatesController;
  let queryBus: jest.Mocked<QueryBus>;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionTemplatesController],
      providers: [
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionTemplatesController>(
      SubscriptionTemplatesController,
    );
    queryBus = module.get(QueryBus);
    commandBus = module.get(CommandBus);
  });

  describe('findAll', () => {
    it('should execute GetSubscriptionTemplatesQuery without category filter', async () => {
      const templates = [{ id: 'tpl-1', name: 'Netflix' }];
      queryBus.execute.mockResolvedValue(templates);

      const result = await controller.findAll(MOCK_USER, undefined);

      expect(result).toEqual(templates);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplatesQuery(MOCK_USER.sub, undefined),
      );
    });

    it('should execute GetSubscriptionTemplatesQuery with category filter', async () => {
      const templates = [{ id: 'tpl-1', name: 'Netflix' }];
      queryBus.execute.mockResolvedValue(templates);

      const result = await controller.findAll(
        MOCK_USER,
        TemplateCategory.STREAMING,
      );

      expect(result).toEqual(templates);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplatesQuery(
          MOCK_USER.sub,
          TemplateCategory.STREAMING,
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should execute GetSubscriptionTemplateQuery with id and userId', async () => {
      const template = { id: 'tpl-uuid', name: 'Netflix' };
      queryBus.execute.mockResolvedValue(template);

      const result = await controller.findOne(MOCK_USER, 'tpl-uuid');

      expect(result).toEqual(template);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplateQuery('tpl-uuid', MOCK_USER.sub),
      );
    });
  });

  describe('prefill', () => {
    it('should execute GetSubscriptionPrefillQuery and return prefill data', async () => {
      const prefillData = {
        amount: 15.99,
        description: 'Netflix',
        frequency: BillingFrequency.MONTHLY,
        serviceUrl: 'https://netflix.com',
        type: SubscriptionType.DIGITAL_SERVICE,
      };
      queryBus.execute.mockResolvedValue(prefillData);

      const result = await controller.prefill('tpl-uuid');

      expect(result).toEqual(prefillData);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionPrefillQuery('tpl-uuid'),
      );
    });

    it('should return prefill data with GENERAL type when no serviceUrl', async () => {
      const prefillData = {
        amount: 9.99,
        description: 'Gym Membership',
        frequency: BillingFrequency.MONTHLY,
        serviceUrl: null,
        type: SubscriptionType.GENERAL,
      };
      queryBus.execute.mockResolvedValue(prefillData);

      const result = await controller.prefill('tpl-uuid-2');

      expect(result).toEqual(prefillData);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionPrefillQuery('tpl-uuid-2'),
      );
    });
  });

  describe('create', () => {
    it('should execute CreateSubscriptionTemplateCommand', async () => {
      const created = { id: 'new-tpl-id', name: 'My Service' };
      commandBus.execute.mockResolvedValue(created);

      const dto: CreateSubscriptionTemplateDto = {
        name: 'My Service',
        templateCategory: TemplateCategory.STREAMING,
        defaultFrequency: BillingFrequency.MONTHLY,
        defaultAmount: 9.99,
      };

      const result = await controller.create(MOCK_USER, dto);

      expect(result).toEqual(created);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSubscriptionTemplateCommand(
          MOCK_USER.sub,
          dto.name,
          dto.templateCategory,
          dto.description,
          dto.iconUrl,
          dto.serviceUrl,
          dto.defaultAmount,
          dto.defaultFrequency,
        ),
      );
    });
  });
});
