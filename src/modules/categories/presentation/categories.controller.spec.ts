import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CategoriesController } from './categories.controller';
import { CreateCategoryCommand } from '../application/commands/create-category.command';
import { GetCategoriesQuery } from '../application/queries/get-categories.query';
import { CreateCategoryDto } from './dtos/create-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
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

    controller = module.get<CategoriesController>(CategoriesController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('findAll', () => {
    it('should execute GetCategoriesQuery with userId from user', async () => {
      const categories = [{ id: 'cat-1', name: 'Food', type: 'expense' }];
      queryBus.execute.mockResolvedValue(categories);

      const user = { userId: 'user-uuid' };
      const result = await controller.findAll(user);

      expect(result).toEqual(categories);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetCategoriesQuery('user-uuid'),
      );
    });
  });

  describe('create', () => {
    it('should execute CreateCategoryCommand with dto data and userId from user', async () => {
      const expectedResult = { id: 'cat-uuid' };
      commandBus.execute.mockResolvedValue(expectedResult);

      const dto: CreateCategoryDto = { name: 'Food', type: 'expense' };
      const user = { userId: 'user-uuid' };
      const result = await controller.create(dto, user);

      expect(result).toEqual(expectedResult);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateCategoryCommand('Food', 'expense', 'user-uuid'),
      );
    });
  });
});
