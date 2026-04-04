import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { SubscriptionTemplatesController } from './subscription-templates.controller';
import { GetSubscriptionTemplatesQuery } from '../application/queries/get-subscription-templates.query';
import { GetSubscriptionTemplateQuery } from '../application/queries/get-subscription-template.query';
import { GetSubscriptionPrefillQuery } from '../application/queries/get-subscription-prefill.query';
import { TemplateCategory } from '../domain/enums/template-category.enum';
import { BillingFrequency } from '../../subscriptions/domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../../subscriptions/domain/enums/subscription-type.enum';

describe('SubscriptionTemplatesController', () => {
  let controller: SubscriptionTemplatesController;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionTemplatesController],
      providers: [
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionTemplatesController>(
      SubscriptionTemplatesController,
    );
    queryBus = module.get(QueryBus);
  });

  describe('findAll', () => {
    it('should execute GetSubscriptionTemplatesQuery without category filter', async () => {
      const templates = [{ id: 'tpl-1', name: 'Netflix' }];
      queryBus.execute.mockResolvedValue(templates);

      const result = await controller.findAll(undefined);

      expect(result).toEqual(templates);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplatesQuery(undefined),
      );
    });

    it('should execute GetSubscriptionTemplatesQuery with category filter', async () => {
      const templates = [{ id: 'tpl-1', name: 'Netflix' }];
      queryBus.execute.mockResolvedValue(templates);

      const result = await controller.findAll(TemplateCategory.STREAMING);

      expect(result).toEqual(templates);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplatesQuery(TemplateCategory.STREAMING),
      );
    });
  });

  describe('findOne', () => {
    it('should execute GetSubscriptionTemplateQuery with id', async () => {
      const template = { id: 'tpl-uuid', name: 'Netflix' };
      queryBus.execute.mockResolvedValue(template);

      const result = await controller.findOne('tpl-uuid');

      expect(result).toEqual(template);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionTemplateQuery('tpl-uuid'),
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
});
