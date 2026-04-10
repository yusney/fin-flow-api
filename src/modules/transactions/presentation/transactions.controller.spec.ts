import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionCommand } from '../application/commands/create-transaction.command';
import { UpdateTransactionCommand } from '../application/commands/update-transaction.command';
import { DeleteTransactionCommand } from '../application/commands/delete-transaction.command';
import { GetTransactionsQuery } from '../application/queries/get-transactions.query';
import { GetSummaryQuery } from '../application/queries/get-summary.query';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
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

    controller = module.get<TransactionsController>(TransactionsController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('findAll', () => {
    it('should execute GetTransactionsQuery with userId and filters', async () => {
      const transactions = [{ id: 'tx-1', amount: 100 }];
      queryBus.execute.mockResolvedValue(transactions);

      const user = { userId: 'user-uuid' };
      const filter = { month: 3, year: 2026 };
      const result = await controller.findAll(user, filter);

      expect(result).toEqual(transactions);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetTransactionsQuery('user-uuid', 3, 2026),
      );
    });
  });

  describe('getSummary', () => {
    it('should execute GetSummaryQuery with userId, month and year', async () => {
      const summary = { totalIncome: 5000, totalExpense: 3000, balance: 2000 };
      queryBus.execute.mockResolvedValue(summary);

      const user = { userId: 'user-uuid' };
      const filter = { month: 3, year: 2026 };
      const result = await controller.getSummary(user, filter);

      expect(result).toEqual(summary);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSummaryQuery('user-uuid', 3, 2026),
      );
    });

    it('should default to current month/year when not provided', async () => {
      const summary = { totalIncome: 0, totalExpense: 0, balance: 0 };
      queryBus.execute.mockResolvedValue(summary);

      const user = { userId: 'user-uuid' };
      const now = new Date();
      const _result = await controller.getSummary(user, {});

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetSummaryQuery('user-uuid', now.getMonth() + 1, now.getFullYear()),
      );
    });
  });

  describe('create', () => {
    it('should execute CreateTransactionCommand with dto data and userId', async () => {
      const expectedResult = { id: 'tx-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto = {
        amount: 100,
        description: 'Grocery',
        date: '2026-03-15',
        categoryId: 'cat-uuid',
      };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto as any, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateTransactionCommand(
          100,
          'Grocery',
          new Date('2026-03-15'),
          'cat-uuid',
          'user-uuid',
        ),
      );
    });
  });

  describe('update', () => {
    it('should execute UpdateTransactionCommand with id, dto and userId', async () => {
      commandBus.execute.mockResolvedValue(undefined);

      const dto = { amount: 200, description: 'Updated' };
      const user = { userId: 'user-uuid' };
      const _result = await controller.update('tx-uuid', dto as any, user);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateTransactionCommand(
          'tx-uuid',
          200,
          'Updated',
          undefined,
          undefined,
          'user-uuid',
        ),
      );
    });
  });

  describe('delete', () => {
    it('should execute DeleteTransactionCommand with id and userId', async () => {
      commandBus.execute.mockResolvedValue(undefined);

      const user = { userId: 'user-uuid' };
      const _result = await controller.delete('tx-uuid', user);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteTransactionCommand('tx-uuid', 'user-uuid'),
      );
    });
  });
});
