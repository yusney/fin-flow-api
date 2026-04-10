import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { CreateSubscriptionCommand } from '../application/commands/create-subscription.command';
import { ToggleSubscriptionCommand } from '../application/commands/toggle-subscription.command';
import { UpdateSubscriptionCommand } from '../application/commands/update-subscription.command';
import { GetSubscriptionsQuery } from '../application/queries/get-subscriptions.query';
import { GetSubscriptionHistoryQuery } from '../application/queries/get-subscription-history.query';
import { BillingFrequency } from '../domain/enums/billing-frequency.enum';
import { SubscriptionType } from '../domain/enums/subscription-type.enum';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from './dtos/update-subscription.dto';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
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

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('findAll', () => {
    it('should execute GetSubscriptionsQuery with userId', async () => {
      const subscriptions = [{ id: 'sub-1', description: 'Netflix' }];
      queryBus.execute.mockResolvedValue(subscriptions);

      const user = { userId: 'user-uuid' };
      const result = await controller.findAll(user);

      expect(result).toEqual(subscriptions);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionsQuery('user-uuid'),
      );
    });
  });

  describe('create', () => {
    it('should execute CreateSubscriptionCommand with dto data and userId', async () => {
      const expectedResult = { id: 'sub-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto: CreateSubscriptionDto = {
        amount: 9.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-uuid',
        startDate: '2026-01-15',
      };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSubscriptionCommand(
          9.99,
          'Netflix',
          15,
          'cat-uuid',
          'user-uuid',
          new Date('2026-01-15'),
          null,
          BillingFrequency.MONTHLY,
          SubscriptionType.GENERAL,
          null,
        ),
      );
    });

    it('should pass all optional fields when provided', async () => {
      const expectedResult = { id: 'sub-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto: CreateSubscriptionDto = {
        amount: 14.99,
        description: 'Spotify',
        billingDay: 1,
        categoryId: 'cat-uuid',
        startDate: '2026-02-01',
        endDate: '2027-02-01',
        frequency: BillingFrequency.ANNUAL,
        type: SubscriptionType.DIGITAL_SERVICE,
        serviceUrl: 'https://spotify.com',
      };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSubscriptionCommand(
          14.99,
          'Spotify',
          1,
          'cat-uuid',
          'user-uuid',
          new Date('2026-02-01'),
          new Date('2027-02-01'),
          BillingFrequency.ANNUAL,
          SubscriptionType.DIGITAL_SERVICE,
          'https://spotify.com',
        ),
      );
    });

    it('should default optional fields when not provided', async () => {
      commandBus.execute.mockResolvedValue({ id: 'sub-uuid' });

      const dto: CreateSubscriptionDto = {
        amount: 9.99,
        description: 'Netflix',
        billingDay: 15,
        categoryId: 'cat-uuid',
        startDate: '2026-01-15',
      };
      const user = { userId: 'user-uuid' };
      await controller.create(dto, user);

      const command = commandBus.execute.mock
        .calls[0][0] as CreateSubscriptionCommand;
      expect(command.startDate).toEqual(new Date('2026-01-15'));
      expect(command.endDate).toBeNull();
      expect(command.frequency).toBe(BillingFrequency.MONTHLY);
      expect(command.type).toBe(SubscriptionType.GENERAL);
      expect(command.serviceUrl).toBeNull();
    });
  });

  describe('toggle', () => {
    it('should execute ToggleSubscriptionCommand with id and userId', async () => {
      const expectedResult = { id: 'sub-uuid', isActive: false };
      commandBus.execute.mockResolvedValue(expectedResult);

      const user = { userId: 'user-uuid' };
      const result = await controller.toggle('sub-uuid', user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new ToggleSubscriptionCommand('sub-uuid', 'user-uuid'),
      );
    });
  });

  describe('update', () => {
    it('should execute UpdateSubscriptionCommand with id, userId and dto fields', async () => {
      const expectedResult = { id: 'new-uuid', amount: 17.99 };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto: UpdateSubscriptionDto = { amount: 17.99 };
      const user = { userId: 'user-uuid' };
      const result = await controller.update('sub-uuid', dto, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateSubscriptionCommand(
          'sub-uuid',
          'user-uuid',
          17.99,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ),
      );
    });

    it('should pass all optional fields when provided', async () => {
      const expectedResult = { id: 'new-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto: UpdateSubscriptionDto = {
        amount: 19.99,
        description: 'Netflix Premium',
        billingDay: 20,
        frequency: BillingFrequency.ANNUAL,
        type: SubscriptionType.DIGITAL_SERVICE,
        serviceUrl: 'https://netflix.com',
      };
      const user = { userId: 'user-uuid' };
      await controller.update('sub-uuid', dto, user);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateSubscriptionCommand(
          'sub-uuid',
          'user-uuid',
          19.99,
          'Netflix Premium',
          20,
          BillingFrequency.ANNUAL,
          SubscriptionType.DIGITAL_SERVICE,
          'https://netflix.com',
        ),
      );
    });

    it('should throw BadRequestException when no fields provided', async () => {
      const dto: UpdateSubscriptionDto = {};
      const user = { userId: 'user-uuid' };

      await expect(controller.update('sub-uuid', dto, user)).rejects.toThrow(
        BadRequestException,
      );
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should execute GetSubscriptionHistoryQuery with id and userId', async () => {
      const history = [
        { id: 'root-uuid', amount: 14.99 },
        { id: 'v2-uuid', amount: 17.99 },
      ];
      queryBus.execute.mockResolvedValue(history);

      const user = { userId: 'user-uuid' };
      const result = await controller.getHistory('root-uuid', user);

      expect(result).toEqual(history);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSubscriptionHistoryQuery('root-uuid', 'user-uuid'),
      );
    });
  });
});
