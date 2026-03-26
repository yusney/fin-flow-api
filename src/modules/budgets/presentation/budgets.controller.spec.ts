import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BudgetsController } from './budgets.controller';
import { CreateBudgetCommand } from '../application/commands/create-budget.command';
import { GetBudgetStatusQuery } from '../application/queries/get-budget-status.query';

describe('BudgetsController', () => {
  let controller: BudgetsController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
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

    controller = module.get<BudgetsController>(BudgetsController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('create', () => {
    it('should execute CreateBudgetCommand with dto data and userId from user', async () => {
      const expectedResult = { id: 'budget-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto = {
        limitAmount: 5000,
        month: 3,
        year: 2026,
        categoryId: 'cat-uuid',
      };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto as any, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateBudgetCommand(5000, 3, 2026, 'cat-uuid', 'user-uuid'),
      );
    });
  });

  describe('getStatus', () => {
    it('should execute GetBudgetStatusQuery with userId, month and year', async () => {
      const statusResult = [
        {
          categoryId: 'cat-uuid',
          limitAmount: 5000,
          spent: 2300,
          remaining: 2700,
        },
      ];
      queryBus.execute.mockResolvedValue(statusResult);

      const user = { userId: 'user-uuid' };
      const filter = { month: 3, year: 2026 };
      const result = await controller.getStatus(user, filter);

      expect(result).toEqual(statusResult);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetBudgetStatusQuery('user-uuid', 3, 2026),
      );
    });
  });
});
